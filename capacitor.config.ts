import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeLog',
  appName: 'lifeLog',
  webDir: '.next',
  bundledWebRuntime: false,
  server:{
    androidScheme: 'https',
    cleartext: true,
  }
  android: {}
};

export default config;
