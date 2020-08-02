import path from "path";
import {createSingleWebpackConfig} from "../../utils.js";
import EsmWebpackPlugin from "../../../esm-webpack-plugin.js";

const indexJs = path.resolve(__dirname, "index.js");
const skipJs = path.resolve(__dirname, 'skip.js');

export const webpackConfig =createSingleWebpackConfig(
    indexJs,
    "multi_module_entry.js"
);

// Define an array entry point, and add `skipModule` callback to not include
// exports for the first module
webpackConfig.entry = [skipJs, indexJs];
webpackConfig.plugins = [
    new EsmWebpackPlugin({
        skipModule(fileName) {
            return /skip\.js$/.test(fileName);
        }
    })
];
