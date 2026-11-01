/**
 * Silence a single benign dependency warning.
 *
 * NativeWind's `react-native-css-interop` registers React Native's deprecated
 * `ImageBackground` for `className` support at import time, which trips RN's
 * one-time `console.warn` deprecation notice — even though we never render
 * `ImageBackground` ourselves. `LogBox.ignoreLogs` only hides the in-app
 * overlay, not the console line, and the warning fires before any component
 * code runs, so we intercept `console.warn` here instead.
 *
 * This module is imported FIRST (before `global.css`, which pulls in NativeWind)
 * so the filter is in place before the warning is emitted. Remove it once the
 * upstream dependency stops touching the deprecated getter.
 */
const SILENCED = ['ImageBackground is deprecated'];

const flag = '__slotifyWarnFilterInstalled';
const g = globalThis as typeof globalThis & { [flag]?: boolean };

// Guard against double-wrapping if this module is imported more than once.
if (!g[flag]) {
  g[flag] = true;
  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string' && SILENCED.some((pattern) => first.includes(pattern))) {
      return;
    }
    originalWarn(...args);
  };
}

export {};
