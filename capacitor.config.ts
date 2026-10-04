import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ornith.communitynetwork',
  appName: 'ORNITH Community Network',
  webDir: 'out',
  server: {
    // Android emulator access loopback to host Next.js server at port 3000
    url: process.env.CAPACITOR_SERVER_URL || 'http://10.0.2.2:3000',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0f172a',
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
