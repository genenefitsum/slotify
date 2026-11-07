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

## Feature setup (external credentials)

Three features are coded and ship inert until you provide credentials. The app
runs cleanly in Expo Go without any of them.

### Google sign-in (native)
1. In the same Google Cloud project as the web app, mint **iOS** and **Android**
   OAuth client IDs. Reuse the web app's **Web** client ID as `webClientId` — the
   backend verifies the ID token's audience against it, so no backend change.
2. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
   (see `.env.example`). `app.config.ts` adds the native config plugin only when
   the iOS client ID is present.
3. Native Google sign-in requires a **dev/EAS build** — it cannot run in Expo Go
   (the button explains this until then).

### Push notifications
1. `eas init` to create the project and write `extra.eas.projectId` to `app.json`
   (required for `getExpoPushTokenAsync`).
2. Run a **dev/EAS build** — push registration is a no-op in Expo Go.
3. Backend: redeploy so the `POST/DELETE /users/me/push-token` endpoints and the
   booking notification hooks are live.

### Help-center support bot
1. Set `ANTHROPIC_API_KEY` on the Render backend and redeploy (mounts
   `POST /api/support/chat`). Without it, the chat shows a graceful "email us"
   fallback. Optional: `SUPPORT_EMAIL` overrides the fallback address.

## Before any build

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```
