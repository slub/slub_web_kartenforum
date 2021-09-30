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
// Directory where to write the output

const outputDir = "../../Resources/Public/";

const cssOutputDir = "css/";
const javascriptOutputDir = "JavaScript/Dist/";

// You can export an array from your config file to build bundles from
// several unrelated inputs at once, even in watch mode. To build different
// bundles with the same input, you supply an array of output options for each input:

// https://rollupjs.org/guide/en/#configuration-files

export const newVar = {
    input: "./src/index.js",
    output: {
        file: path.resolve(
            __dirname,
            `${outputDir}${javascriptOutputDir}vk2-min.js`
        ),
        format: "iife",
        name: "vk2",
        sourcemap: "inline",
    },
    onwarn: function (warning) {
        if (warning.code === "THIS_IS_UNDEFINED") {
            return;
        }
        console.error(warning.message);
    },
    plugins: [
        babel({
            presets: ["@babel/preset-react"],
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
        }),
        peerDepsExternal(),
        resolve({
            browser: true,
            extensions: [".js", ".jsx", ".json"],
            jsnext: true,
            preferBuiltins: true,
        }),
        rollupJson(),
        commonjs(),
        scss({
            output: path.resolve(
                __dirname,
                `${outputDir}${cssOutputDir}index.css`
            ),
            // outputStyle: "compressed",
        }),
    ],
    preserveEntrySignatures: "strict",
};

export default newVar;
