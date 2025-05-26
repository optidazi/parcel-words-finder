
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.141d903c68a74ba99afdd9a28b2cb09d',
  appName: 'What3Words Parcel Scanner',
  webDir: 'dist',
  server: {
    url: 'https://141d903c-68a7-4ba9-9afd-d9a28b2cb09d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;
