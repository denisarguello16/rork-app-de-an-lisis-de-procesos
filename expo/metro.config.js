const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

/**
 * Expo's default Metro config disables Watchman (`resolver.useWatchman = null`,
 * which Expo's file-map fork treats as `false`), falling back to Node's raw
 * `fs.watch()` — one OS watch handle PER DIRECTORY it crawls. This project's
 * node_modules tree has far more directories than the sandbox's inotify watch
 * limit allows, so the fallback watcher crashes on startup with EINVAL/ENOSPC
 * before Metro can ever serve the app.
 *
 * Watchman is installed and working in this environment and watches an entire
 * tree through a single daemon connection instead of per-directory handles, so
 * force it back on here to avoid the crash entirely.
 */
config.resolver.useWatchman = true;

module.exports = withRorkMetro(config);
