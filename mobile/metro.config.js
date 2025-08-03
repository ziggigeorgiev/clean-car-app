const { getDefaultConfig } = require('expo/metro-config'); // If using Expo
// const { getDefaultConfig } = require('metro-config');    // If not using Expo

const config = getDefaultConfig(__dirname);

config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles']; // Only for Expo
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = config;
