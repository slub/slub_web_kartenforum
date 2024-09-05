/**
 * Created by jacob.mendt@pikobytes.de on 17.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { build } from "./esbuild.base.js";

// Define constants
const outputDir = "../Resources/Public/Build/";

const options = {
    entryPoints: ["./src/apps/mosaic_map/index.jsx"],
    outfile: `${outputDir}plugin-map-mosaic.js`,
};

// Run the build process with the supplied options
build(options);
