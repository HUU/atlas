/*

This script does the same thing as `dotenv-vault local build` except that
it attempts to preserve any vaults that already exist.

Why?
The default behavior otherwise is to wipe the .env.vault file and only write
vaults for existing .env files...this presents a problem for us because most
developers will not have staging or production .env files. The result is that
we keep blowing away vaults or developers must ask a "production key holder"
to update secrets. This makes it possible for developers to edit .env
like they're used to naturally without worrying about the esoteric nature of how
we manage secrets in other environments.

*/
import { writeFileSync, readFileSync } from 'fs';
import { LocalBuildService } from 'dotenv-vault/dist/services/local/build-service';

function parseEnvAssignment(
  line: string,
): { key: string; value: string } | undefined {
  const lineParts = line.match(/([A-Za-z0-9_]+)=(.+)/);
  if (lineParts == null) {
    return undefined;
  }

  return { key: lineParts[1], value: lineParts[2] };
}

const buildService = new LocalBuildService();
const partialNewVault = buildService.vaultData;
const originalVault = readFileSync(buildService.vaultName, 'utf8');
const newVault = new Map<string, string>();

// Extract existing vaults
for (const line of originalVault.split('\n')) {
  const environment = parseEnvAssignment(line.trim());
  if (environment != null) {
    newVault.set(environment.key, environment.value);
  }
}

// Apply any changes from the local checked out .env file(s)
for (const line of partialNewVault.split('\n')) {
  const environment = parseEnvAssignment(line.trim());
  if (environment != null) {
    console.error(`Updating ${environment.key}...`);
    newVault.set(environment.key, environment.value);
  }
}

// Combine the final vaults into a proper .env.vault and save it
let finalizedVault = '';
for (const [environment, vault] of newVault) {
  finalizedVault += `${environment}=${vault}\n`;
}

writeFileSync(buildService.vaultName, finalizedVault);
