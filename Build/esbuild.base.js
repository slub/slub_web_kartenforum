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
    loader: {
        ".gif": "dataurl",
        ".png": "dataurl",
        ".svg": "dataurl",
    },
    globalName: "vk2",
    minify: isWatch && isProduction,
    target: "es6",
    plugins: [
        sassPlugin({ cache: true }),
        {
            name: "my-plugin",
            setup(build) {
                let count = 0;
                build.onEnd((result) => {
                    if (count++ === 0) console.log(result, "🚀 First build.");
                    else
                        console.log(
                            {
                                warnings: result.warnings,
                                errors: result.errors,
                            },
                            "♻ Refreshed"
                        );
                });
            },
        },
    ],
};

export async function build(options) {
    if (isWatch) {
        const context = await esbuild.context({ ...baseOptions, ...options });

        await context.rebuild();

        await context.watch();
    } else {
        try {
            await esbuild.build(options);
            console.log("Build completed");
        } catch (error) {
            console.error("Build failed:", error);
            process.exit(1);
        }
    }
}
