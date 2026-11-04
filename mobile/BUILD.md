# Building & releasing Slotify mobile

Expo SDK 58 · New Architecture. Day-to-day development runs in Expo Go / the
dev server (`npx expo start`). Native-module features (embedded maps, etc.) and
store builds require an **EAS development/production build** — Expo Go can't load
custom native code.

## One-time setup

```bash
cd mobile
npm install -g eas-cli      # or: npx eas-cli@latest
eas login
eas init                    # links the project and writes extra.eas.projectId to app.json
```

`eas init` generates the project id and (for OTA) the `updates.url`. We don't
commit a fabricated id — run `eas init` once per Expo account/project.

## Development build (dev client)

Use this to run the app with custom native modules on a simulator or device.

```bash
eas build --profile development --platform ios        # simulator build
eas build --profile development --platform android
# then install the artifact and start the dev server:
npx expo start --dev-client
```

The `development` profile sets `ios.simulator: true` and a default
`EXPO_PUBLIC_API_BASE_URL` — override it for a device by pointing at your LAN IP.

## Preview / production builds

```bash
eas build --profile preview --platform all            # internal distribution
eas build --profile production --platform all          # store-ready, auto-increments
```

## Over-the-air (OTA) updates

JS-only changes ship without a new native build via `eas update`. `runtimeVersion`
is pinned to `appVersion` (`app.json`), so an update only reaches builds with a
matching runtime.

```bash
eas update --channel preview --message "Describe the change"
eas update --channel production --message "Describe the change"
```

## Before any build

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```
