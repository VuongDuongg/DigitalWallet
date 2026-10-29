import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digitalwallet.app',
  appName: 'Digital Wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Cho phép kết nối HTTP tới Backend Spring Boot trong môi trường dev
  },
};

export default config;

