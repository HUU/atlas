import type { Nitro, NitroPreset } from 'nitropack';
import { cp, glob, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import realPackage from '../package.json';
import packageTemplate from './package.template.json';

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
  packageObject.name = `${realPackage.name}/gcp`;
  await writeFile(filePath, JSON.stringify(packageObject, null, 2));
}

const preset: NitroPreset = {
  extends: 'node-server',
  hooks: {
    async compiled(ctx: Nitro) {
      await _copyAssets(
        '../../libraries/database/migrations',
        ctx.options.output.serverDir,
      );
      await _copyAssets('.env.*', ctx.options.output.serverDir, {
        exclude: ['.env.keys'],
      });
      await _copyAssets('./gcp/Dockerfile', ctx.options.output.dir);
      await _savePackageTemplate(
        path.join(ctx.options.output.dir, 'package.json'),
      );
    },
  },
};

export default preset;
