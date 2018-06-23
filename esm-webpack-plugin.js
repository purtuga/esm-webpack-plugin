const ConcatSource = require("webpack-sources").ConcatSource;
const PLUGIN_NAME = "EsmWebpackPlugin";
const warn = msg => console.warn(`[${PLUGIN_NAME}] ${msg}`);

/**
 * Add ESM `export` statements to the bottom of a webpack chunk
 * with the exposed exports.
 */
module.exports = class EsmWebpackPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, compilationTap);
    }
};


function compilationTap(compilation) {
    const libVar = compilation.outputOptions.library;

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
            if (chunk.entryModule.buildMeta.providedExports) {
                if (chunk.files.length > 1) {
                    warn(`Was expecting only 1 file for chunk "${chunk.name}" (found: ${chunk.files.length})!`);
                }

                // Add the exports to the bottom of the file (expecting only one file) and
                // add that file back to the compilation
                chunk.files.forEach(fileName => {
                    compilation.assets[fileName] = new ConcatSource(
                        compilation.assets[fileName],
                        "\n\n",
                        // generate the list of exports
                        chunk.entryModule.buildMeta.providedExports.reduce((esm_exports, exportName) => {
                            if (exportName === "default") {
                                esm_exports += `export default ${libVar}['${exportName}'];` + "\n"
                            } else {
                                esm_exports += `export const ${exportName} = ${libVar}['${exportName}'];` + "\n"
                            }
                            return esm_exports;
                        }, "")
                    );
                });
            }
        });

        done();
    });
}
