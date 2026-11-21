const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Share the website's framework-free logic (generator, vault, strength, breach) from ../lib
// so there is one implementation across the website, the Chrome extension and this app.
config.watchFolders = [...(config.watchFolders ?? []), path.resolve(__dirname, '../lib')];

module.exports = config;
