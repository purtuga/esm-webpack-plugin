import path from "path";
import {createSingleWebpackConfig} from "../../utils.js";


export const webpackConfig =createSingleWebpackConfig(
    path.resolve(__dirname, "index.js"),
    "export_globals.js"
);