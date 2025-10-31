# EAS dev client — build steps (Android + iOS)

This document explains how to create a custom development client that includes native modules (for example, modules that provide native keychain or biometric features) so you can test native functionality while developing.

Prerequisites

- Node.js + npm installed
- An Expo project (this repo uses Expo)
- For iOS builds: macOS + Apple Developer account

1. Install EAS CLI

```bash
npm install -g eas-cli
```

2. Login to Expo

```bash
eas login
```

3. Configure the project for EAS builds

```bash
eas build:configure
```

This will add an `eas.json` (if missing) and guide you through project configuration.

4. Create a development build

Android:

```bash
eas build -p android --profile development
```

iOS (macOS + Apple account required):

```bash
eas build -p ios --profile development
```

A development build is a custom client that includes your native dependencies. When the build completes, download and install the APK/IPA on your device or emulator.

5. Start Metro in dev-client mode

```bash
expo start --dev-client
```

Open the installed dev client app and load the Metro bundle (scan the QR or use the device/emulator options). Your app will now run inside the dev client with native modules available.

Alternative: Prebuild + local native run

If you prefer to run the native app locally without EAS, you can prebuild the native projects and run them:

```bash
npx expo prebuild
npx pod-install
npx react-native run-android
npx react-native run-ios
```

Notes

- Keep the SecureStore fallback in `services/keychainService.js` so the app doesn't crash when run inside Expo Go.
- For biometrics testing: enable biometric simulation in Android emulator or use a physical device; for iOS, configure Face ID/Touch ID in the Simulator.
- If you change native dependencies, rebuild the dev client so the native code is included.

Troubleshooting

- If the native module still appears `null` after installing the dev client, try reinstalling node modules and rebuilding the dev client.
- For iOS build issues, check CocoaPods output and ensure you ran `pod install` during prebuild/local runs.
