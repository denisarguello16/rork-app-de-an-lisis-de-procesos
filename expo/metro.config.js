const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

/**
 * Metro (without Watchman) opens one inotify watch per directory. The dependency
 * tree contains thousands of directories that are never part of the app bundle
 * (tooling, tests, fixtures, docs, type definitions), which exhausts the system
 * watch limit and makes the dev server fail to start with EINVAL/ENOSPC.
 *
 * These paths are excluded from the file map so they are neither crawled nor
 * watched. None of them are reachable from application code at runtime.
 */
const ignoredNodeModulePaths = [
  // Lint/type tooling — build-time only, never bundled.
  /\/node_modules\/eslint\/.*/,
  /\/node_modules\/eslint-.*/,
  /\/node_modules\/@eslint\/.*/,
  /\/node_modules\/@eslint-community\/.*/,
  /\/node_modules\/@typescript-eslint\/.*/,
  /\/node_modules\/typescript\/.*/,
  // Test suites, fixtures and docs shipped inside published packages.
  /\/node_modules\/.*\/__tests__\/.*/,
  /\/node_modules\/.*\/__fixtures__\/.*/,
  /\/node_modules\/.*\/test\/.*/,
  /\/node_modules\/.*\/tests\/.*/,
  /\/node_modules\/.*\/docs\/.*/,
  /\/node_modules\/.*\/typings\/.*/,
  // Native Android/iOS sources — not used by Metro's JS bundling.
  /\/node_modules\/react-native\/ReactAndroid\/.*/,
  /\/node_modules\/react-native\/Libraries\/.*\/__snapshots__\/.*/,
  /\/node_modules\/@react-native\/debugger-frontend\/.*/,
];

const existingBlockList = config.resolver.blockList;
const normalizedExistingBlockList = Array.isArray(existingBlockList)
  ? existingBlockList
  : existingBlockList
    ? [existingBlockList]
    : [];

config.resolver.blockList = [
  ...normalizedExistingBlockList,
  ...ignoredNodeModulePaths,
];

module.exports = withRorkMetro(config);
