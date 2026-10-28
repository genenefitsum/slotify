module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource enables NativeWind's className->style transform.
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // NOTE: Do not add 'react-native-worklets/plugin' here.
    // babel-preset-expo (SDK 58) auto-injects the Reanimated/Worklets plugin;
    // adding it again makes Reanimated throw "plugin added more than once".
  };
};
