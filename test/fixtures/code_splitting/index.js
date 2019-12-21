// @see https://github.com/purtuga/esm-webpack-plugin/issues/4

export function loadA() {
    return import("./a.js")
}
