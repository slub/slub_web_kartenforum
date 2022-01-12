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
import image from "@rollup/plugin-image";
import { terser } from "rollup-plugin-terser";

import {
    cssOutputDir,
    isProduction,
    javascriptOutputDir,
    outputDir,
} from "./rollup.constants";

// You can export an array from your config file to build bundles from
// several unrelated inputs at once, even in watch mode. To build different
// bundles with the same input, you supply an array of output options for each input:

// https://rollupjs.org/guide/en/#configuration-files
export const configs = {
    cache: true,
    input: "./src/apps/admin/index.js",
    output: {
        file: path.resolve(
            __dirname,
            `${outputDir}${javascriptOutputDir}plugin-admin.js`
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
            babelHelpers: "bundled",
            exclude: "node_modules/**",
            inputSourceMap: false,
            presets: ["@babel/preset-react"],
            sourceMaps: false,
        }),
        replace({
            "process.env.NODE_ENV": isProduction
                ? JSON.stringify("production")
                : JSON.stringify("development"),
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
                `${outputDir}${cssOutputDir}plugin-admin.css`
            ),
            outputStyle: "compressed",
        }),
        image({ dom: true }),
        isProduction && terser(),
    ],
    preserveEntrySignatures: "strict",
};

export default configs;
