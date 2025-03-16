import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import * as _ from 'radashi';
import yaml from 'yaml';
import { z } from 'zod';

// Schema for package.json
const packageJsonSchema = z.object({
  dependencies: z.record(z.string()).optional(),
  devDependencies: z.record(z.string()).optional(),
});

// Schema for pnpm-lock.yaml
const lockFileSchema = z.object({
  importers: z.record(
    z
      .object({
        dependencies: z
          .record(
            z.object({
              specifier: z.string(),
            }),
          )
          .optional(),
        devDependencies: z
          .record(
            z.object({
              specifier: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
  ),
});

// Schema for pnpm-workspace.yaml
const workspaceConfigSchema = z.object({
  packages: z.array(z.string()),
});

interface IValidationError {
  packagePath: string;
  type:
    | 'missing_in_lockfile'
    | 'missing_in_package_json'
    | 'specifier_mismatch'
    | 'extra_package';
  details: string;
}

function readPackageJson(filePath: string): z.infer<typeof packageJsonSchema> {
  const content = fs.readFileSync(filePath, 'utf-8');
  return packageJsonSchema.parse(JSON.parse(content));
}

function readLockFile(): z.infer<typeof lockFileSchema> {
  const content = fs.readFileSync('pnpm-lock.yaml', 'utf-8');
  return lockFileSchema.parse(yaml.parse(content));
}

function readWorkspaceConfig(): z.infer<typeof workspaceConfigSchema> {
  const content = fs.readFileSync('pnpm-workspace.yaml', 'utf-8');
  return workspaceConfigSchema.parse(yaml.parse(content));
}

function findPackageJsonFiles(): string[] {
  const workspacePatterns = readWorkspaceConfig().packages;
  const packageJsons: string[] = [];

  for (const pattern of workspacePatterns) {
    const matchingDirs = glob.sync(pattern);
    for (const dir of matchingDirs) {
      const packageJsonPath = path.join(dir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        packageJsons.push(dir);
      }
    }
  }

  // ...also add root package.json if it exists
  if (fs.existsSync('package.json')) {
    packageJsons.push('.');
  }

  return packageJsons;
}

function validateDependencies(
  packagePath: string,
  dependencies: Record<string, string>,
  lockfileDependencies: Record<string, string>,
): IValidationError[] {
  const errors: IValidationError[] = [];

  // Check for missing or mismatched dependencies
  for (const [dep, version] of Object.entries(dependencies)) {
    const lockDep = lockfileDependencies[dep];
    if (!lockDep) {
      errors.push({
        packagePath,
        type: 'missing_in_lockfile',
        details: `${dep} is missing in lockfile for ${packagePath}`,
      });
    } else if (lockDep !== version) {
      errors.push({
        packagePath,
        type: 'specifier_mismatch',
        details: `${dep} version mismatch in ${packagePath}: package.json has ${version}, lockfile has ${lockDep}`,
      });
    }
  }

  // Check for extra dependencies in lockfile
  for (const dep of _.diff(
    Object.keys(lockfileDependencies),
    Object.keys(dependencies),
  )) {
    errors.push({
      packagePath,
      type: 'missing_in_package_json',
      details: `${dep} is in lockfile but not in package.json for ${packagePath}`,
    });
  }

  return errors;
}

function validateLockfile(): IValidationError[] {
  const errors: IValidationError[] = [];
  const lockfile = readLockFile();
  const packagePaths = findPackageJsonFiles();

  for (const packagePath of packagePaths) {
    const packageJson = readPackageJson(path.join(packagePath, 'package.json'));
    const lockfileEntry = lockfile.importers[packagePath];

    if (!lockfileEntry) {
      errors.push({
        packagePath,
        type: 'missing_in_lockfile',
        details: `Package at ${packagePath} is missing in pnpm-lock.yaml`,
      });
      continue;
    }

    // Check regular dependencies
    if (packageJson.dependencies) {
      errors.push(
        ...validateDependencies(
          packagePath,
          packageJson.dependencies,
          lockfileEntry.dependencies
            ? _.mapValues(lockfileEntry.dependencies, (x) => x.specifier)
            : {},
        ),
      );
    }

    // Check dev dependencies
    if (packageJson.devDependencies) {
      errors.push(
        ...validateDependencies(
          packagePath,
          packageJson.devDependencies,
          lockfileEntry.devDependencies
            ? _.mapValues(lockfileEntry.devDependencies, (x) => x.specifier)
            : {},
        ),
      );
    }
  }

  for (const packagePath of _.diff(
    Object.keys(lockfile.importers),
    packagePaths,
  )) {
    errors.push({
      packagePath,
      type: 'extra_package',
      details: `Lockfile has a package at ${packagePath} but there is no corresponding package.json`,
    });
  }

  return errors;
}

const errors = validateLockfile();

if (errors.length === 0) {
  // eslint-disable-next-line no-console -- this is a CLI tool
  console.log('✅ Lockfile is up to date with all package.json files');
  process.exit(0);
} else {
  // eslint-disable-next-line no-console -- this is a CLI tool
  console.error(
    '❌ Found inconsistencies between lockfile and package.json files, run `pnpm install` to fix:',
  );
  for (const error of errors) {
    // eslint-disable-next-line no-console -- this is a CLI tool
    console.error(`\n[${error.packagePath}] ${error.type}:`);
    // eslint-disable-next-line no-console -- this is a CLI tool
    console.error(error.details);
  }
  process.exit(1);
}
