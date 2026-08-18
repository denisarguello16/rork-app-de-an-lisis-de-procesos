const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);
const rorkConfig = withRorkMetro(config);
const originalResolveRequest = rorkConfig.resolver?.resolveRequest;
const toolkitRoot = path.dirname(
  require.resolve("@rork-ai/toolkit-sdk/package.json"),
);
const analyticsModule = path.join(toolkitRoot, "lib/module/analytics.js");

rorkConfig.resolver = {
  ...rorkConfig.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // The package root re-exports the AI agent, whose Node-only dynamic import
    // cannot be transformed by Expo. The injected root layout only needs analytics.
    if (moduleName === "@rork-ai/toolkit-sdk") {
      return {
        filePath: analyticsModule,
        type: "sourceFile",
      };
    }

    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = rorkConfig;
