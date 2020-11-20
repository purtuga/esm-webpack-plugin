# esm-webpack-plugin

Output an ESM library from your bundle. Adds `export` statements to the end of the bundle for the exported members. Ideal for consumption by Javascript environments that support the ESM spec (aka: all major modern browsers).


> **IMPORTANT: This Plugin is currently only supported with Webpack 4.x.**
> __________
> The purpose of this plugin was to provide a temporary workaround until support for ESM lands in Webpack, which at one point was targeted for [v5.0](https://webpack.js.org/blog/2020-10-10-webpack-5-release/) but unfortunately it did not land. My current understanding is that the Webapck team will continue to make progress in introducing full support for ESM output bundles at the v5.x level, but unclear what version it will actually land on. At this time, I don't have plans to release a version of this Plugin that supports Webpack v5.0, but if someone wants to contribute the necessary changes to make this compatible with v5.x, I will consider it 🙏 .
> 
> __________


## Install

```bash
npm i -D @purtuga/esm-webpack-plugin
```

## Usage

In your webpack configuration (`webpack.config.js`):

```javascript
const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "index.js",
    output: {
        library: "LIB",
        libraryTarget: "var"
    },
    //...
    plugins: [
        new EsmWebpackPlugin()
    ]
}
```

Notice the use of `output.library` and `output.libraryTarget`, which indicates a library is being built and the bundle will expose it via a scoped variable named `LIB`.

>   __NOTE__: the value for `output.library` should NOT match the name of an exported library member.

>   If using this plugin on a CommonJS source project, see the FAQ below for more information.

## Options

Options are supported by providing an object to the Plugin constructor. All are optional. Example:

```javascript
const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");

module.exports = {
    //...
    plugins: [
        new EsmWebpackPlugin({
            /*... Plugin Options here ...*/
        })
    ]
}
```

### Supported options:

-   `exclude {Function}`: A callback function that will be used to determine if a given file name (a named output file) should be excluded from processing. By default, all files whose file extension does **not** end with `.js` or `.mjs` will be excluded (meaning: no ESM `export` statements will be added to the output file). Note that callback is applied to the named output chunks that webpack outputs.
    Function callback will receive two arguments - the `fileName` that is being process and webpack's `chunk` object that contains that file name.
```javascript
new EsmWebpackPlugin({
    exclude(fileName, chunk) {
        // exclude if not a .js/.mjs/.cjs file
        return !/\.[cm]?js/i.test(fileName);
    }
})
```

- `skipModule {Function}`: A callback function that can be used to skip over certain modules whose exports should not be included. Useful for when certain development plugins from webpack are used (like the `devServer`). The callback is provided with two arguments - the file name for the given module and the Webpack module class instance.
Example - don't include webpack devServer generated bundles and modules:
```javascript
new EsmWebpackPlugin({
    exclude(fileName) {
        // Exclude if:
        //  a. not a js file
        //  b. is a devServer.hot file
        return !/\.[cm]?js$/i.test(fileName) ||
            /\.hot-update\.js$/i.test(fileName);
    },
    skipModule(fileName, module) {
        return /[\\\/]webpack(-dev-server)?[\\\/]/.test(moduleName);
    }
})
```

- `moduleExternals {boolean}`: A boolean that determines whether [webpack externals](https://webpack.js.org/configuration/externals/#root) should be imported as ES modules or not. Defaults to `false`.
When set to true, the defined webpack `externals` will be added to the output ES module as `import`'s. Example: Given the following code module
```javascript
import foo from 'foo-mod'

export const doFoo = () => foo();
```
with a webpack configuration containing the following:
```javascript
const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");

module.exports = {
    //...
    externals: {
        'foo-mod': '/some/external/location/foo-mod.js'
    },
    plugins: [
        new EsmWebpackPlugin({
            /*... Plugin Options here ...*/
        })
    ]
}
```
would generate an ESM with the following `import`:
```javascript
import * as __WEBPACK_EXTERNAL_MODULE__0__ from '/some/external/location/foo-mod.js';

var LIB =
/******/ (function(modules) { // webpackBootstrap
//...
})();
//...
export {
    _LIB$doFoo as doFoo
}
```

- `esModuleExternals {boolean}`: This option applies only when `moduleExternals` options is `true` (see above). A boolean that determines whether esm-webpack-plugin will add the `__esModule` property to all imported externals. This can be helpful for improving interop between CJS and ESM modules, since webpack treats modules with the `__esModule` property differently than modules without them. Defaults to `true`.

    To add the `__esModule` property, esm-webpack-plugin uses a function `cloneWithEsModuleProperty()` which creates a new object that proxies to the original module, since ES modules are not extensible.

## Example

Given the above Usage example:

### Entry File: `index.js`

```javascript
import {horn} from "lib/noises"
export {bark} from "lib/noises"

export function makeHornNoise() {
    horn();
}

export default makeHornNoise;

```

### Library module `lib/noises.js`

```javascript
export function horn() {
    return "honk honk";
}

export function bark() {
    return "woof woof";
}

```

### Output Bundle

```javascript
var LIB = (/******/ (function(modules){/* webpack bundle code */}));

export const bark = LIB['bark'];
export const makeHornNoise = LIB['makeHornNoise'];
export default LIB['default'];

```


### Example of usage on the Browser

In the browser:

```html
<script type="module">
    import MyLibrary from "MyLibrary.js";
    MyLibrary(); // makeHornNoise
</script>
```

Or:

```html
<script type="module">
    import {bark, makeHornNoise} from "MyLibrary.js"
    bark();
    makeHornNoise();
</script>
```

# FAQ

## When using the generated ESM library, un-used exports are not removed from final output (not three-shaken)

This is, unfortunately, a drawback and limitation of this plugin. This plugin does not change how the code is bundled or structured by webpack and only adds `export` statements to the end of file in order to enable its use via ES6 `import`. Because of that, tree-shaking is not possible - all code is already bundled and stored using webpack's internal structure. The ability to possibly support tree-shaking can only truly be supported when webpack itself introduces support for generating ESM output targets.
  
My advice is to use the generated ESM modules at runtime when no build/bundling pipeline exists on a project and to `import` source directly (if that is coded as ESM) when a pipeline does exists.


## With CommonJS project, individual `exports` are not available in the output ESM module
This project was created primarily for use in sources that are developed using ESM. The default behavior, if the plugin is unable to identify explicit `export`'s is to expose the entire library object (the `LIB` variable as seen in the examples above). A workaround that might work is to create an `ESM` entry source file whose sole purpose is to expose the desired members and use that as your webpack `entry` file.  Here is an example:

File `/index.cjs`:
```javascript
exports.libA = require("./lib-a.cjs").libA;
exports.cjsIndex = function cjsIndex() {
    console.log("src-cjs/index.cjs loaded!");
}
```

File `/index.mjs` (use this with webpack):
```javascript
import * as cjs from "./index.cjs";

const { libA, cjsIndex } = cjs;

export default cjs;
export {
    libA,
    cjsIndex
};
```

Note that in order for this work, I believe (have not confirmed) that webpack's mode needs to be  `javascript/auto` which I think is currently the default.


## Uncaught SyntaxError: Identifier 'MyLibrary' has already been declared

Where `MyLibrary` is the same name as the `output.library` value in your `webpack.config.js` file. 

This occurs when your library exports a member that is named the same as the value found in the `output.library` value. It is suggested that you use an obscure value for `output.library` - one that has low probability of matching an exported member's name. 


## TypeError: chunk.entryModule.buildMeta.providedExports.reduce is not a function

Console output:
```
/home/prj/node_modules/@purtuga/esm-webpack-plugin/esm-webpack-plugin.js:45
    chunk.entryModule.buildMeta.providedExports.reduce((esm_exports, exportName) => {
                                                ^

TypeError: chunk.entryModule.buildMeta.providedExports.reduce is not a function
```

In order to create an ESM package, webpack must be able to identify your module exports. This error is likey due to the fact that it was not able to do that. You can run your build with `--bail --display-optimization-bailout` to see if the following message is output against your entry module: 
`ModuleConcatenation bailout: Module exports are unknown`

The root cause is likely due to exporting modules using the `*` syntax where different modules have an export named exactly the same. Example:

`index.js`
```javascript
export * from "mod1.js";
export * from "mod1.js"
```

Where both modules have an export name `foo`. To address this issue, try using named exports instead:

```javascript
export {foo} from "mod1.js";
export {foo as foo2} from "mod2.js"
```



# License

[MIT](LICENSE)
