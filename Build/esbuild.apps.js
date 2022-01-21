/**
 * Created by jacob.mendt@pikobytes.de on 17.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import esbuild from "esbuild";
import sass from "esbuild-plugin-sass";

// Define constants
const outputDir = "../Resources/Public/Build/";
const isWatch = process.env.MODE === "watch";
const isProduction = process.env.NODE_ENV === "production";

esbuild
    .build({
        bundle: true,
        entryPoints: ["./src/apps/apps/index.jsx"],
        globalName: "vk2",
        loader: {
            ".gif": "dataurl",
            ".png": "dataurl",
            ".svg": "dataurl",
        },
        minify: isProduction,
        target: "es6",
        plugins: [sass()],
        outfile: `${outputDir}plugin-apps.js`,
        watch: isWatch
            ? {
                  onRebuild(error, result) {
                      if (error) console.error("watch build failed:", error);
                      else console.log("watch build succeeded:", result);
                  },
              }
            : false,
    })
    .catch(() => process.exit(1));
