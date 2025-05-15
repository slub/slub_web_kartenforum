/*
 * Created by tom.schulze@pikobytes.de on 13.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { readFile } from "fs/promises";
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import { default as standaloneCode } from "ajv/dist/standalone/index.js";

export const generateAjvFeatureCollectionValidator = async () => {
    console.log("Generating AJV FeatureCollection standalone validator");
    const pathToSchema = new URL(
        "./node_modules/geojson-schema/FeatureCollection.json",
        import.meta.url
    );

    const schema = JSON.parse(await readFile(pathToSchema));

    // The generated code will have a default export:
    // `module.exports = <validateFunctionCode>;module.exports.default = <validateFunctionCode>;`
    const ajv = new Ajv({ strict: true, code: { source: true, esm: true } });
    const validate = ajv.compile(schema);
    let moduleCode = standaloneCode(ajv, validate);

    const destination = "src/util/schemas/validateFeatureCollection.js";
    const outputPath = path.join(import.meta.dirname, destination);

    fs.writeFileSync(outputPath, moduleCode);
    console.log(`Saved FeatureCollection validator to '${outputPath}'\n`);
};
