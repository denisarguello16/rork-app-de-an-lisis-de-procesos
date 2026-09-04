const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

/**
 * This sandbox cannot run Watchman (it refuses to start here: "Watchman is
 * running at a lower than normal priority... refusing to start"), so Metro
 * always falls back to Node's raw per-directory `fs.watch()` crawler/watcher.
 * That fallback opens one OS watch handle PER DIRECTORY it crawls under
 * node_modules, which vastly exceeds this sandbox's inotify watch limit and
 * crashes the dev server on startup (EINVAL/ENOSPC) before it can ever serve
 * the app — leaving connected devices stuck on a stale cached manifest.
 *
 * The crawler/watcher DOES respect `resolver.blockList` (merged into Metro's
 * internal `ignorePattern`) to skip whole directories entirely, so excluding
 * every native/non-JS directory here is what keeps the number of watched
 * directories under the OS limit. Must cover NESTED node_modules too (e.g.
 * `@react-native/codegen/node_modules/@babel/parser/node_modules/@babel/types`),
 * since only ".*" (not "[^/]+") reliably matches across those extra segments.
 */
const ignoredNodeModulePaths = [
  // Native Android/iOS sources and prebuilt binaries shipped inside any
  // package (react-native itself and most expo-*/react-native-* packages
  // with native code). This project has no local android/ios folders of its
  // own, so it's safe to exclude every "/android/" or "/ios/" path segment
  // anywhere under node_modules, including nested node_modules.
  /\/node_modules\/.*\/android\/.*/,
  /\/node_modules\/.*\/ios\/.*/,
  /\/node_modules\/.*\/prebuilds\/.*/,
  /\/node_modules\/.*\.xcframework\/.*/,
  /\/node_modules\/.*\/ReactAndroid\/.*/,
  /\/node_modules\/.*\/ReactCommon\/.*/,
  /\/node_modules\/.*\/debugger-frontend\/.*/,
  /\/node_modules\/.*\/__snapshots__\/.*/,
  // Lint/type tooling — build-time only, never bundled.
  /\/node_modules\/.*\/eslint\/.*/,
  /\/node_modules\/.*\/eslint-.*/,
  /\/node_modules\/.*\/@eslint\/.*/,
  /\/node_modules\/.*\/@eslint-community\/.*/,
  /\/node_modules\/.*\/@typescript-eslint\/.*/,
  /\/node_modules\/.*\/typescript\/.*/,
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
