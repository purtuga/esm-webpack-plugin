const ConcatSource = require("webpack-sources").ConcatSource;
const MultiModule = require("webpack/lib/MultiModule");
const PLUGIN_NAME = "EsmWebpackPlugin";
const warn = msg => console.warn(`[${PLUGIN_NAME}] ${msg}`);
const IS_JS_FILE = /\.[cm]?js$/i;
const nonJsFiles = fileName => !IS_JS_FILE.test(fileName);

/**
 * Add ESM `export` statements to the bottom of a webpack chunk
 * with the exposed exports.
 */
module.exports = class EsmWebpackPlugin {
    /**
     *
     * @param {Object} [options]
     * @param {Function} [options.exclude]
     *  A callback function to evaluate each output file name and determine if it should be
     *  excluded from being wrapped with ESM exports. By default, all files whose
     *  file extension is not `.js` or `.mjs` will be excluded.
     *  The provided callback will receive two input arguments:
     *  -   `{String} fileName`: the file name being evaluated
     *  -   `{Chunk} chunk`: the webpack `chunk` being worked on.
     */
    constructor(options = { exclude: nonJsFiles }) {
        this._options = options;
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, compilationTap.bind(this));
    }
};

function exportsForModule(module, libVar) {
	let exports = "";
	if (module instanceof MultiModule) {
		module.dependencies.forEach(dependency => {
			exports += exportsForModule(dependency.module, libVar);
		});
	} else if (Array.isArray(module.buildMeta.providedExports)) {
		module.buildMeta.providedExports.forEach(exportName => {
            if (exportName === "default") {
                exports += `export default ${libVar}['${exportName}'];\n`
            } else {
                exports += `export const ${exportName} = ${libVar}['${exportName}'];\n`
            }
		});
	} else {
        exports += `export default ${libVar};\n`
    }
	return exports;
}

function compilationTap(compilation) {
    const libVar = compilation.outputOptions.library;
    const exclude = this._options.exclude;

    if (!libVar) {
        warn("output.library is expected to be set!");
    }

    if (
        compilation.outputOptions.libraryTarget &&
        compilation.outputOptions.libraryTarget !== "var" &&
        compilation.outputOptions.libraryTarget !== "assign"
    ) {
        warn(`output.libraryTarget (${compilation.outputOptions.libraryTarget}) expected to be 'var' or 'assign'!`);
    }

    compilation.hooks.optimizeChunkAssets.tapAsync(PLUGIN_NAME, (chunks, done) => {
        chunks.forEach(chunk => {
            if (chunk.entryModule && chunk.entryModule.buildMeta.providedExports) {
                chunk.files.forEach(fileName => {
                    if (exclude && exclude(fileName, chunk)) {
                        return;
                    }

                    // Add the exports to the bottom of the file (expecting only one file) and
                    // add that file back to the compilation
                    compilation.assets[fileName] = new ConcatSource(
                        compilation.assets[fileName],
                        "\n\n",
                        exportsForModule(chunk.entryModule, libVar)
                    );
                });
            }
        });

        done();
    });
}
