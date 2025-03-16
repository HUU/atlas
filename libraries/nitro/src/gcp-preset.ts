/**
 * Custom preset to generate output that works with CloudRun/AppEngine deployment
 * either by packaging into a Zip and uploading to AppEngine or by docker
 * building and pushing to CloudRun.
 */

import MagicString from 'magic-string';
import { fileURLToPath, resolvePath } from 'mlly';
import type { NitroPreset } from 'nitropack';
import { cp, glob, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { normalize } from 'node:path';
import packageTemplate from '../templates/package.template.json';

async function _copyAssets(
  globPattern: string,
  outDir: string,
  options?: { exclude?: string[] },
): Promise<void> {
  const files = glob(globPattern);
  const copyOps = [];
  for await (const file of files) {
    if (options?.exclude?.includes(file)) continue;

    const outputPath = path.join(outDir, path.basename(file));
    copyOps.push(
      cp(file, outputPath, {
        dereference: true,
        preserveTimestamps: true,
        recursive: true,
      }),
    );
  }
  await Promise.all(copyOps);
}

async function _savePackageTemplate(filePath: string): Promise<void> {
  const packageObject = { ...packageTemplate };
  //packageObject.name = `${realPackage.name}/gcp`;
  await writeFile(filePath, JSON.stringify(packageObject, null, 2));
}

const preset: NitroPreset = {
  extends: 'node-server',
  hooks: {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- must match existing base class
    async 'rollup:before'(_ctx, rollupConfig) {
      const modulePath = await resolvePath('./entry', {
        url: import.meta.url,
        extensions: ['.ts'],
      });

      rollupConfig.plugins ??= [];
      if (Array.isArray(rollupConfig.plugins)) {
        rollupConfig.plugins.push({
          name: 'inject-init-plugin',
          async transform(code, id) {
            const normalizedId = normalize(id);
            if (
              normalizedId.includes('runtime/entries') ||
              this.getModuleInfo(id)?.isEntry
            ) {
              // transform nitro entry file (we don't want to copy-paste the existing entry file, dumb to maintain that)
              const s = new MagicString(code);
              s.prepend(`import '${modulePath}';`);

              return {
                code: s.toString(),
                map: s.generateMap({ hires: true }),
                moduleSideEffects: true,
              };
            } else if (normalizedId === modulePath) {
              //  mark the import as having side effects so it doesn't get tree-shaken
              const s = new MagicString(code);
              return {
                moduleSideEffects: true,
                code: s.toString(),
                map: s.generateMap({ hires: true }),
              };
            } else {
              return undefined;
            }
          },
        });
      }
    },

    async 'compiled'(ctx) {
      const templateDir = fileURLToPath(
        new URL('../templates', import.meta.url),
      );

      if (ctx.options.gcp?.includeFiles) {
        const copyOptions = {
          ...(ctx.options.gcp.excludeFiles && {
            exclude: ctx.options.gcp.excludeFiles,
          }),
        };

        for (const includeGlob of ctx.options.gcp.includeFiles) {
          await _copyAssets(
            includeGlob,
            ctx.options.output.serverDir,
            copyOptions,
          );
        }
      }

      await _copyAssets(
        path.join(templateDir, 'Dockerfile'),
        ctx.options.output.dir,
      );
      await _savePackageTemplate(
        path.join(ctx.options.output.dir, 'package.json'),
      );
    },
  },
};

// eslint-disable-next-line import/no-default-export -- Nitro expects deployment presets to be default exports
export default preset;
