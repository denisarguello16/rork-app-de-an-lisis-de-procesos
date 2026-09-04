const { execSync } = require("child_process");
const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

/**
 * This sandbox cannot run Watchman (it refuses to start here: "Watchman is
 * running at a lower than normal priority... refusing to start"), so Metro
 * always falls back to Node's raw per-directory `fs.watch()` crawler/watcher
 * (FallbackWatcher). That fallback opens one OS inotify watch handle PER
 * DIRECTORY it crawls, and this project's node_modules tree has tens of
 * thousands of directories (deeply nested transitive deps like @babel/*,
 * @typescript-eslint/*, etc. each carrying their own nested node_modules).
 * The sandbox's default inotify limits are far too low for that, so the dev
 * server used to crash with EINVAL/ENOSPC on an essentially random directory
 * once the OS-wide watch count was exhausted.
 *
 * Raising the limits via `sysctl`/`/proc` only lasts until the sandbox is
 * restarted, so it must be redone on every Metro startup rather than once by
 * hand. Doing it here (synchronously, before Metro builds its file map) makes
 * it self-healing: every time the dev server boots, it re-raises the limits
 * itself. This is a container-local, best-effort tweak (never touches user
 * app code) and is safely skipped if the sandbox ever restricts sudo.
 */
function ensureInotifyLimits() {
  try {
    execSync(
      "sudo sh -c 'echo 1048576 > /proc/sys/fs/inotify/max_user_watches; echo 8192 > /proc/sys/fs/inotify/max_user_instances'",
      { stdio: "ignore" },
    );
  } catch {
    // Best-effort only — if sudo/proc access isn't available, fall back to
    // relying solely on the blockList exclusions below.
  }
}

ensureInotifyLimits();

const config = getDefaultConfig(__dirname);

/**
 * On top of raising OS limits, still exclude directories that are 100%
 * native build trees or build-time-only tooling from Metro's crawl/watch and
 * resolution (via `resolver.blockList`, which metro also reuses as the file
 * watcher's `ignorePattern` — see metro/src/node-haste/DependencyGraph/createFileMap.js).
 * This further shrinks the directory count so we stay under the limit even
 * if the sysctl bump above is ever unavailable.
 *
 * IMPORTANT: only exclude directories that are genuinely native-only. Many
 * packages (e.g. react-native-screens, expo-symbols) legitimately ship their
 * JS/TS source split into "ios/"/"android/" SUBFOLDERS that Metro must still
 * resolve at bundle time — blocking every "/ios/" or "/android/" path segment
 * breaks those imports. So patterns below only target known heavy
 * native-only package roots, not arbitrary source-split folders.
 */
const ignoredNodeModulePaths = [
  // react-native's own native Android/iOS project trees (huge, native-only).
  /\/node_modules\/react-native\/(android|ReactAndroid|ReactCommon)\/.*/,
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
