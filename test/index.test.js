import {describe, it} from "mocha";
import assert from "assert";
import {buildFixtures} from "./utils.js";

describe("esm-webpack-plugin", () => {
    const build = buildFixtures();

    it("should build fixtures", async () => {
        await build;
        assert.ok("fixtures compile");
    });

    it("should handle code splitting", async () => {
        // https://github.com/purtuga/esm-webpack-plugin/issues/4
        const buildResults = await build;
        const module = await buildResults.code_splitting.import();
        assert.ok(module.loadA);
        assert.ok(!module.fnA);

        const loadAResponse = await module.loadA();
        assert.equal(loadAResponse.fnA(), "hello fnA");
        assert.equal(loadAResponse.fnB(), "hello fnB");
    });

    it("should export CommonJS modules as `default`", async () => {
        // https://github.com/purtuga/esm-webpack-plugin/issues/9
        const buildResults = await build;
        const module = await buildResults.cjs_module.import();
        assert.ok(module.default.fnA);
        assert.ok(module.default.fnB);
    });

    it("should prevents GLOBALs conflicts when naming exports", async () => {
        // See issue: https://github.com/purtuga/esm-webpack-plugin/issues/12
        const buildResults = await build;
        const module = await buildResults.export_globals.import();
        assert.ok(module.Math);
        assert.equal(module.Math.square(2), 4);
    });
});
