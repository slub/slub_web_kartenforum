/**
 * Created by jacob.mendt@pikobytes.de on 17.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import esbuild from "esbuild";
import sass from "esbuild-plugin-sass";
import watcher from "@parcel/watcher";

// Define constants
const outputDir = "../Resources/Public/Build/";
const isWatch = process.env.MODE === "watch";
const isProduction = process.env.NODE_ENV === "production";

let time = new Date();
let result = esbuild
    .build({
        bundle: true,
        entryPoints: ["./src/apps/map/index.jsx"],
        globalName: "vk2",
        loader: {
            ".gif": "dataurl",
            ".png": "dataurl",
            ".svg": "dataurl",
        },
        minify: !isWatch && isProduction,
        target: "es6",
        plugins: [sass({ cache: true })],
        outfile: `${outputDir}plugin-map.js`,
        incremental: isWatch,
        // watch: isWatch
        //     ? {
        //           onRebuild(error, result) {
        //               if (error) console.error("watch build failed:", error);
        //               else console.log("watch build succeeded:", result);
        //           },
        //       }
        //     : false,
    })
    .then((r) => {
        console.log(
            "Build succeeded in: " + ((Date.now() - time) / 1000).toFixed(2)
        );
        return r;
    })
    .catch(() => process.exit(1));

if (isWatch) {
    const subscription = await watcher.subscribe(
        process.cwd(),
        (err, events) => {
            time = new Date();
            result = result
                .then((r) => r.rebuild())
                .then((r) => {
                    console.log(
                        "Rebuild. Elapsed time:" +
                            ((Date.now() - time) / 1000).toFixed(2),
                        { errors: r.errors, warning: r.warnings }
                    );
                    return r;
                });
        }
    );
}
