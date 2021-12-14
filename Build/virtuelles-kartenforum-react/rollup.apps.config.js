/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

// https://blog.harveydelaney.com/creating-your-own-react-component-library/
import path from "path";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "rollup-plugin-replace";
import rollupJson from "rollup-plugin-json";
import scss from "rollup-plugin-scss";
import babel from "@rollup/plugin-babel";
import builtins from "rollup-plugin-node-builtins";

import {
    cssOutputDir,
    javascriptOutputDir,
    outputDir,
} from "./rollup.constants";

// You can export an array from your config file to build bundles from
// several unrelated inputs at once, even in watch mode. To build different
// bundles with the same input, you supply an array of output options for each input:

// https://rollupjs.org/guide/en/#configuration-files

export const configs = {
    cache: true,
    input: "./src/apps/apps/index.js",
    output: {
        file: path.resolve(
            __dirname,
            `${outputDir}${javascriptOutputDir}plugin-apps.js`
        ),
        format: "iife",
        name: "vk2",
        sourcemap: "inline",
    },
    onwarn: function (warning, superOnWarn) {
        if (
            warning.code === "THIS_IS_UNDEFINED" ||
            warning.code === "SOURCEMAP_ERROR"
        ) {
            return;
        }
        superOnWarn(warning);
    },
    plugins: [
        builtins(),
        babel({
            sourceMaps: false,
            inputSourceMap: false,
            presets: ["@babel/preset-react"],
            babelHelpers: "bundled",
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
        }),
        peerDepsExternal(),
        resolve({
            mainFields: ["browser", "jsnext"],
            extensions: [".js", ".jsx", ".json"],
            preferBuiltins: true,
        }),
        rollupJson(),
        commonjs(),
        scss({
            output: path.resolve(
                __dirname,
                `${outputDir}${cssOutputDir}plugin-apps.css`
            ),
            outputStyle: "compressed",
        }),
    ],
    preserveEntrySignatures: "strict",
};

export default configs;
