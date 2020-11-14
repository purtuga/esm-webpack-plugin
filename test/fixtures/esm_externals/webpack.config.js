import path from "path";
import { createSingleWebpackConfig } from "../../utils.js";

const config = createSingleWebpackConfig(
    path.resolve(__dirname, "index.js"),
    "esm_externals.js",
    {
      moduleExternals: true
    }
);

// Set some externals, which will be loaded via `import` at runtime.
config.externals = {
  foo: '../../test/fixtures/esm_externals/foo-external.js',
  bar: '../../test/fixtures/esm_externals/bar-external.js',
};

export const webpackConfig = config;
