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
 * the app.
 *
 * IMPORTANT: only exclude directories that are 100% native build trees
 * (Gradle/CocoaPods projects, prebuilt binaries). Many packages (e.g.
 * react-native-screens, expo-symbols) legitimately ship their JS/TS source
 * split into "ios/"/"android/" SUBFOLDERS that Metro must still resolve at
 * bundle time — blocking every "/ios/" or "/android/" path segment breaks
 * those imports. So patterns below only target the known heavy native-only
 * package roots, not arbitrary source-split folders inside any package.
 */
const ignoredNodeModulePaths = [
  // react-native's own native Android/iOS project trees (huge, native-only).
  /\/node_modules\/react-native\/(android|ReactAndroid|ReactCommon)\/.*/,
  /\/node_modules\/react-native\/(?!.*\.(js|jsx|ts|tsx|json)$).*\/ios\/.*/,
  /\/node_modules\/react-native\/Libraries\/.*\/(android|ios)\/(?!.*\.(js|jsx|ts|tsx|json)$).*/,
  // @react-native/* native codegen/gradle-plugin trees.
  /\/node_modules\/@react-native\/[^/]+\/android\/.*/,
  /\/node_modules\/@react-native\/[^/]+\/ios\/.*/,
  // Prebuilt binaries / xcframeworks anywhere.
  /\/node_modules\/.*\/prebuilds\/.*/,
  /\/node_modules\/.*\.xcframework\/.*/,
  /\/node_modules\/.*\/debugger-frontend\/.*/,
  /\/node_modules\/.*\/__snapshots__\/.*/,
  // Lint/type tooling — build-time only, never bundled.
  /\/node_modules\/.*\/eslint\/.*/,
  /\/node_modules\/.*\/eslint-.*/,
  /\/node_modules\/.*\/@eslint\/.*/,
  /\/node_modules\/.*\/@eslint-community\/.*/,
  /\/node_modules\/.*\/@typescript-eslint\/.*/,
  /\/node_modules\/typescript\/.*/,
  // Test suites, fixtures and docs shipped inside published packages.
  /\/node_modules\/.*\/__tests__\/.*/,
  /\/node_modules\/.*\/__fixtures__\/.*/,
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
