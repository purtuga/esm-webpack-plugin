# esm-webpack-plugin

Output an ESM library from your bundle. Adds `export` statements to the end of the bundle for the exported members. Ideal for consumption by Javascript environments that support the ESM spec (aka: all major modern browsers).

Currently only for webpack 4 and above.

## Install

```bash
npm i -D @purtuga/esm-webpack-plugin
``` 

## Usage

In your webpack configuration (`webpack.config.js`):

```javascript
const EsmWebpackPlugin = require("esm-webpack-plugin");

module.exports = {
    mode: "development",
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

Note the use of `output.library` and `output.libraryTarget`, which indicates a library is being built and the bundle will expose it via a scoped variable named `LIB`.

>   __NOTE__: the value for `output.library` should NOT match the name of an exported library member.
 

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

## Uncaught SyntaxError: Identifier 'MyLibrary' has already been declared

Where `MyLibrary` is the same name as the `output.library` value in your `webpack.config.js` file. 

This occurs when your library exports a member that is named the same as the value found in the `output.library` value. It is suggested that you use an obscure value for `output.library` - one that has low probability of matching an exported member's name. 


# License

[MIT](LICENSE)
