import archiver from 'archiver';
import type { Nitro, NitroPreset } from 'nitropack';
import { createWriteStream } from 'node:fs';
import { cp, glob, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import realPackage from '../package.json';
import packageTemplate from './package.template.json';

async function _zipDirectory(dir: string, outFile: string): Promise<undefined> {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = createWriteStream(outFile);

  // eslint-disable-next-line promise/avoid-new -- wrapping an FS stream into a promise intentionally
  await new Promise((resolve, reject) => {
    archive
      // we follow symlinks to ensure resulting zip is flat and won't get barfed on by GCP buildpacks which don't follow symlinks
      .glob('**/*', { cwd: dir, nodir: true, dot: true, follow: true })
      .on('error', (err: Error) => {
        reject(err);
      })
      .pipe(stream);

    stream.on('close', () => {
      resolve(undefined);
    });
    void archive.finalize();
  });
}
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
        '.output/server',
      );
      await _copyAssets('.env.*', '.output/server', { exclude: ['.env.keys'] });
      await _savePackageTemplate('.output/package.json');
      await _zipDirectory(
        ctx.options.output.dir,
        `${ctx.options.output.dir}/deploy.zip`,
      );
    },
  },
};

export default preset;
