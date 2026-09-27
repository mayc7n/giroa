const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');
config.resolver.sourceExts = config.resolver.sourceExts.filter((extension) => extension !== 'wasm');

module.exports = config;
