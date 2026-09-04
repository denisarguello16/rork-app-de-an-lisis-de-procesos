const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

/**
 * Metro (without Watchman) opens one inotify watch per directory it crawls. The
 * dependency tree contains thousands of directories that are never part of the
 * JS bundle — native Android/iOS sources, prebuilt xcframeworks, tooling, tests,
 * fixtures, docs, type definitions — which exhausts the system watch limit and
 * makes the dev server crash on startup with EINVAL/ENOSPC before it can ever
 * serve the app, leaving Expo Go stuck on a stale cached manifest.
 *
 * These paths are excluded from the file map so they are neither crawled nor
 * watched. None of them are reachable from application JS at runtime.
 */
const ignoredNodeModulePaths = [
  // Native Android/iOS sources and prebuilt binaries shipped inside packages —
  // not used by Metro's JS bundling, present in react-native itself and in
  // most expo-* / react-native-* packages with native code.
  /\/node_modules\/[^/]+\/android\/.*/,
  /\/node_modules\/[^/]+\/ios\/.*/,
  /\/node_modules\/[^/]+\/prebuilds\/.*/,
  /\/node_modules\/[^/]+\/\*\.xcframework\/.*/,
  /\/node_modules\/react-native\/ReactAndroid\/.*/,
  /\/node_modules\/react-native\/ReactCommon\/.*/,
  /\/node_modules\/react-native\/Libraries\/.*\/__snapshots__\/.*/,
  /\/node_modules\/@react-native\/debugger-frontend\/.*/,
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
