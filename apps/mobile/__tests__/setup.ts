import { load } from '@expo/env';

// expo .env support is not automatically rigged up by expo-jest (dumb)
// this also requires patching the default transformer to preserve env vars (dumber)
load(process.cwd(), { silent: true, force: true });
