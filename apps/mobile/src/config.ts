function readConfigOrDie(value?: string): string {
  if (!value) {
    throw new Error('Missing a required environment variable.');
  } else {
    return value;
  }
}

export const config = {
  publicApiUrl: readConfigOrDie(process.env.EXPO_PUBLIC_API_URL),
};
