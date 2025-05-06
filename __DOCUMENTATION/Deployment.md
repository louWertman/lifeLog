# LifeLog Deployment Instructions
## Next.config.ts
If this does not contain the following configuration it will not build
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
      unoptimized: true,
    },
    output: "export",
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
```

## Capacitor Configuration
```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeLog',
  appName: 'lifeLog',
  webDir: 'out',
  bundledWebRuntime: false,
  android: {},
  ios: {}
};

export default config;
```
## Web(Firebase)
The Code folder already has the configuration set up for Firebase Deployment.

First initialize Firebase
```sh
pnpm firebase init hosting
```

From there check your API keys with your console and then Edit your firebase.json to:
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Then run the following
```sh
pnpm build # important
pnpm firebase deploy
```

## Android
First install Android studio and make sure the enviorment variables are configured. 
```sh
pnpm build # important
npx cap init android
npx cap sync android
npx cap build android
npx cap run android
```

## IOS
make sure XCode is installed and you are logged in
```sh
npx cap init ios
npx cap sync ios
npx cap build ios #this will fail
```
After that go into the ios/ folder and grab the app.xcodeworkspace. From there choose the scheme:

 Product > Schemes > CapacitorApp

Select your development target/destination (simulation or physical device)

Click the Build/Run button, nothing will show up then. Go back to the terminal
```sh
npx cap run ios
```