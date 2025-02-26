import MagicString from 'magic-string';
import { resolvePath } from 'mlly';
import type { NitroPreset } from 'nitropack';
import { cp, glob, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { normalize } from 'node:path';
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
