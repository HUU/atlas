const IS_PROD =
  process.env.CI !== undefined || process.env.NODE_ENV === 'production';

export default {
  name: IS_PROD ? 'Atlas' : 'Atlas (dev)',
  slug: 'atlas',
  version: '1.0.0',
  platforms: ['ios', 'android'],
  orientation: 'portrait',
  icon: IS_PROD ? './assets/images/icon.png' : './assets/images/icon-dev.png',
  scheme: 'atlas',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_PROD ? 'com.huu.atlas' : 'com.huu.atlas.dev',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: IS_PROD
        ? './assets/images/adaptive-icon.png'
        : './assets/images/adaptive-icon-dev.png',
      backgroundColor: '#ffffff',
    },
    package: IS_PROD ? 'com.huu.atlas' : 'com.huu.atlas.dev',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: IS_PROD
          ? './assets/images/splash.png'
          : './assets/images/splash-dev.png',
        imageWidth: 1125,
        resizeMode: 'cover',
        backgroundColor: '#000000',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};
