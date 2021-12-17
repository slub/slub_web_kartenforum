/**
 *
 * Rollup config for JS and SCSS processing
 * ================================================
 * Base config for the build processes
 * related to the TYPO3 frame components
 *
 * Author: Thomas Jung <thomas@jung.digital>
 *
 */

/*jshint esversion: 6 */

import scss from "rollup-plugin-scss";
import postcss from "postcss";
import autoprefixer from "autoprefixer";

export const configuration = {
    cache: true,
    input: "../Resources/Private/JavaScript/main.js",
    output: {
        file: "../Resources/Public/JavaScript/frontend.js",
        format: "es",
        sourcemap: "inline",
    },
    plugins: [
        scss({
            processor: () => postcss([autoprefixer()]),
            include: "../Resources/Private/Scss/**/*.scss",
            output: "../Resources/Public/Css/frontend.css",
            outputStyle: "compressed",
            failOnError: true,
            watch: "../Resources/Private/Scss/",
        }),
    ],
};

export default configuration;
