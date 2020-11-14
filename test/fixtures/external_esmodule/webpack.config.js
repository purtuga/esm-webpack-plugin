import path from "path";
import { createSingleWebpackConfig } from "../../utils.js";

const config = createSingleWebpackConfig(
    path.resolve(__dirname, "index.js"),
    "external_esmodule.js",
    {
      moduleExternals: true,
      esModuleExternals: true
    }
);

config.externals = {
  foo: '../../test/fixtures/external_esmodule/foo-external.js',
}

export const webpackConfig = config
