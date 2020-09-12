import path from "path";
import { createSingleWebpackConfig } from "../../utils.js";

const config = createSingleWebpackConfig(
    path.resolve(__dirname, "index.js"),
    "global_externals.js",
    {
      moduleExternals: false
    }
);

// Set some externals, which will be loaded via `import` at runtime.
config.externals = {
  foo: 'globalFoo',
  bar: 'globalBar',
}

export const webpackConfig = config
