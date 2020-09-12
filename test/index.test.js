import {describe, it} from "mocha";
import assert from "assert";
import {buildFixtures} from "./utils.js";

describe("When esm-webpack-plugin is invoked", () => {
    const build = buildFixtures();

    it("should build fixtures", async () => {
        await build;
        assert.ok("fixtures compile");
    });

    it("should export ESM modules", async () => {
        // https://github.com/purtuga/esm-webpack-plugin/issues/9
        const buildResults = await build;
        const module = await buildResults.esm_module.import();
        assert.ok(module.default);
        assert.ok(module.getStaticOne);
        assert.ok(module.STATIC_ONE);
        assert.ok(module.default === module.fnDefault);
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

    it("should support skipModule option", async () => {
        const buildResults = await build;
        const module = await buildResults.multi_module_entry.import();
        assert.ok(module.includeFn);
        assert.ok(module.default);
    });

    it("should import esm externals", async () => {
        const buildResults = await build;
        const module = await buildResults.esm_externals.import();
        const fooExternal = await import('./fixtures/esm_externals/foo-external.js');
        const barExternal = await import('./fixtures/esm_externals/bar-external.js');
        assert.strictEqual(module.externals.foo, fooExternal)
        assert.strictEqual(module.externals.bar, barExternal)
    });

    it("should import global externals", async () => {
        const buildResults = await build;
        global.globalFoo = "foo value";
        global.globalBar = "bar value";
        const module = await buildResults.global_externals.import();
        assert.strictEqual(module.externals.foo, "foo value");
        assert.strictEqual(module.externals.bar, "bar value");
    });
});
