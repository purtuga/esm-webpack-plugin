import {promisify} from "util";
import webpack from "webpack";
import {readdir} from "fs";
import path from "path";
import assert from "assert";
import EsmWebpackPlugin from "../esm-webpack-plugin.js";


//===[ MODULE ]===========================================================

const webpackAsync = promisify(webpack);
const readdirAsync = promisify(readdir);

const fixturesDir = path.resolve(__dirname, "fixtures");
const fixturesBuildOutputDir = path.join(path.resolve(__dirname, ".."), "tmp", "fixture_test");

async function getWebpackConfigs() {
    const configs = await Promise.all(
        (await readdirAsync(fixturesDir))
            .map(dirName => import(path.join(fixturesDir, dirName, "webpack.config.js")).then(module => module.webpackConfig)));
    return configs;
}

function b() {
    return Promise.resolve({ a: {import(){}, results: {}} });
}

/**
 * Builds all the fixtures
 *
 * @returns {Promise<{ fixture_name: { import: (function()), result: {}}}>}
 */
async function buildFixtures() {
    const webpackConfig = await getWebpackConfigs();
    const results = await webpackAsync(webpackConfig);
    results.stats.some(buildStats => {
        if (buildStats.hasErrors()) {
            throw new Error(buildStats.toString());
        }
    });
    return webpackConfig.reduce((fixtures, config, i) => {
        fixtures[path.basename(path.dirname(config.entry))] = {
            import: () => import(path.join(config.output.path, config.output.filename)),
            result: results.stats[i]
        };
        return fixtures;
    }, {});
}

function createSingleWebpackConfig(entryFilePath, outputFilename) {
    assert.equal(typeof entryFilePath, "string");
    assert.equal(typeof outputFilename, "string");

    return {
        mode: "production",
        entry: entryFilePath,
        output: {
            library: "LIB",
            libraryTarget: "var",
            filename: outputFilename,
            path: fixturesBuildOutputDir
        },
        plugins: [
            new EsmWebpackPlugin()
        ],
        optimization: {
            minimize: false,
            splitChunks: { chunks: 'all' }
        }
    };
}

//===[  EXPORTS  ]========================================================
export {
    fixturesBuildOutputDir,
    buildFixtures,
    createSingleWebpackConfig
};

