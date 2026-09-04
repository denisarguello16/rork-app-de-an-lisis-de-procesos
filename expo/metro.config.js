const { getDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require("@expo/metro/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

/**
 * Expo's Metro config unconditionally forces `resolver.useWatchman = null`
 * (treated as `false`) every time `getDefaultConfig` runs — including a SECOND,
 * internal call to `getDefaultConfig` that Expo's own config loader makes and
 * then merges on top of whatever this file exports. That second merge silently
 * discards a plain property mutation made here, so `useWatchman` must instead
 * be baked in through `mergeConfig` so it survives that later merge.
 *
 * Without Watchman, Metro falls back to Node's raw `fs.watch()`, opening one OS
 * watch handle PER DIRECTORY it crawls. This project's node_modules tree has far
 * more directories than the sandbox's inotify watch limit allows, so the
 * fallback watcher crashes on startup with EINVAL/ENOSPC before Metro can ever
 * serve the app — which is why devices stay stuck on a stale cached manifest.
 *
 * Watchman is installed and running in this environment and watches an entire
 * tree through a single daemon connection instead of per-directory handles, so
 * force it back on here.
 */
const configWithWatchman = mergeConfig(config, {
  resolver: {
    useWatchman: true,
  },
});

module.exports = withRorkMetro(configWithWatchman);
