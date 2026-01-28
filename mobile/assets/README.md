# Asset Placeholders

This directory should contain the following assets:

## Required Assets

### icon.png
- App icon for iOS and Android
- Recommended size: 1024x1024px
- Format: PNG with transparency

### splash.png  
- Splash screen image
- Recommended size: 1284x2778px (iPhone 14 Pro Max)
- Format: PNG
- Should use brand color (#6C5CE7) as background

### adaptive-icon.png
- Android adaptive icon foreground
- Recommended size: 1024x1024px
- Format: PNG with transparency
- Icon should be centered with padding for safe zone

### favicon.png
- Web favicon
- Recommended size: 48x48px
- Format: PNG

## Generating Assets

You can use Expo's asset generator:

```bash
npx expo-asset@latest --generate
```

Or create them manually following the Expo asset guidelines:
https://docs.expo.dev/develop/user-interface/splash-screen/
https://docs.expo.dev/develop/user-interface/app-icons/
