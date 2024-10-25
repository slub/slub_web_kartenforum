/**
 * Created by nicolas.looschen@pikobytes.de on 05.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

// Define constants
const isWatch = process.env.MODE === "watch";
const isProduction = process.env.NODE_ENV === "production";

const baseOptions = {
    bundle: true,
    define: {
        "process.env.DEV_MODE_SECRET": JSON.stringify(""),
        "process.env.DEV_MODE_NAME": JSON.stringify(""),
    },
    loader: {
        ".gif": "dataurl",
        ".png": "dataurl",
        ".svg": "dataurl",
    },
    globalName: "vk2",
    minify: !isWatch && isProduction,
    sourcemap: isWatch && !isProduction ? "inline" : false,
    target: "es6",
    plugins: [
        sassPlugin({ cache: true }),
        {
            name: "my-plugin",
            setup(build) {
                let count = 0;
                build.onEnd((result) => {
                    if (count++ === 0) console.log(result, "🚀 First build.");
                    else console.log("♻ Refreshed");
                });
            },
        },
    ],
};

export async function build(options) {
    const context = await esbuild.context({ ...baseOptions, ...options });

    await context.rebuild();

    // Watch the files
    if (isWatch) {
        await context.watch();
    } else {
        return context.dispose();
    }
}
