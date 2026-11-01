// Custom entry: install the console.warn filter (silence-warnings) before
// anything else loads — in particular before NativeWind's JSX runtime registers
// RN's deprecated ImageBackground and emits its one-time deprecation warning.
// Then hand off to Expo Router's standard entry.
import './src/lib/silence-warnings';
import 'expo-router/entry';
