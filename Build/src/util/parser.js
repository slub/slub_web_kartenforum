/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { HistoricMapLayer } from "../apps/map/components/CustomLayers/HistoricMapLayer.js";

/**
 * Function parses a search record from an elasticsearch query into
 * an ol object.
 *
 * @static
 * @param {string} id
 * @param {Object} record
 * @param {boolean} is3d
 * @return {HistoricMapLayer}
 */
export const readFeature = function (id, record, is3d) {
    const geometry = "geometry" in record ? record["geometry"] : undefined;
    const properties = {};

    delete record["geometry"];

    for (let key in record) {
        if (Object.hasOwn(record, key)) {
            if (key === "time_published") {
                // parse time value in old format
                const timeValue = record[key].split("-")[0];
                properties[key] = timeValue;
            } else {
                properties[key] = record[key];
            }
        }
    }

    properties["id"] = id;

    return new HistoricMapLayer({ metadata: properties, geometry });
};

/**
 * Function parses an array of search record from an elasticsearch query into
 * an ol object.
 *
 * @static
 * @param {Array.<Object>} records
 * @return {Array.<ol.Feature>}
 */
export const readFeatures = function (records) {
    const features = [];
    for (let i = 0, ii = records.length; i < ii; i++) {
        features.push(readFeature(records[i]["_id"], records[i]["_source"]));
    }

    return features;
};

export const readMosaicMap = (mosaicMap) => {
    const { time_of_publication, ...rest } = mosaicMap;

    return {
        time_of_publication: parseInt(time_of_publication.split("-")[0]),
        ...rest,
    };
};

export const serializeMosaicMap = (mosaicMap) => {
    const { time_of_publication, ...rest } = mosaicMap;

    return {
        time_of_publication: `${time_of_publication}-01-01T00:00:00`,
        ...rest,
    };
};
