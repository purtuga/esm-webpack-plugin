import path from "path";
import { createSingleWebpackConfig } from "../../utils.js";

const config = createSingleWebpackConfig(
    path.resolve(__dirname, "index.js"),
    "externals.js"
);

// Set some externals, which will be loaded via `import` at runtime.
config.externals = {
  foo: '../../test/fixtures/externals/foo-external.js',
  bar: '../../test/fixtures/externals/bar-external.js',
}

export const webpackConfig = config
