import path from "path";
import { createSingleWebpackConfig } from "../../utils.js";

const webpackConfig = createSingleWebpackConfig(
    path.resolve(__dirname, "index.js"),
    "code_splitting.js"
);

// For this one, because we're running test in nodeJS, we need to set the target so
// that the bundle is not looking for `window`
webpackConfig.target = "node";

export {
    webpackConfig
}
