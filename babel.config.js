module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 runs on Worklets; its babel plugin must stay last.
    plugins: ['react-native-worklets/plugin'],
  };
};
