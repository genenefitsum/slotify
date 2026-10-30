import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic config layered on top of app.json.
 *
 * The native Google Sign-In plugin needs the iOS "reversed client ID" URL
 * scheme. We derive it from EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID so the value lives
 * in .env (not committed) — and only add the plugin when that's set, so the app
 * still prebuilds when Google isn't configured yet.
 */
function iosUrlScheme(): string | undefined {
  const id = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  if (!id || !id.endsWith('.apps.googleusercontent.com')) return undefined;
  return `com.googleusercontent.apps.${id.replace('.apps.googleusercontent.com', '')}`;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const scheme = iosUrlScheme();
  const plugins = [...(config.plugins ?? [])];

  if (scheme) {
    plugins.push(['@react-native-google-signin/google-signin', { iosUrlScheme: scheme }]);
  }

  return {
    ...config,
    name: config.name ?? 'Slotify',
    slug: config.slug ?? 'slotify',
    plugins,
  };
};
