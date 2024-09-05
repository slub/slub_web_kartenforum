/**
 * Created by nicolas.looschen@pikobytes.de on 28.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { build } from "./esbuild.base.js";

// Define constants
const outputDir = "../Resources/Public/Build/";

const options = {
    entryPoints: ["./src/apps/upload/index.jsx"],
    outfile: `${outputDir}plugin-upload-map.js`,
};

// Run the build process with the supplied options
build(options);
