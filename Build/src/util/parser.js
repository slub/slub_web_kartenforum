/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { Feature } from "ol";
import { Polygon } from "ol/geom";

/**
 * Function parses a search record from an elasticsearch query into
 * an ol object.
 *
 * @static
 * @param {string} id
 * @param {Object} record
 * @param {boolean} is3d
 * @return {ol.Feature}
 */
export const readFeature = function (id, record, is3d) {
    /**
     * Functions parse the geometry of the search record.
     *
     * - Function supports right now only simple polygons. No MultiPolygons.
     * @param {Array.<number>} coordinates
     * @param {string} type
     * @return {ol.geom.Geometry|undefined}
     */
    const readGeometry = function (coordinates, type) {
        if (type.toLowerCase() === "polygon") {
            // parse polygon
            const coords = [];
            for (let i = 0, ii = coordinates.length; i < ii; i++) {
                // transform coordinates in correct projection
                const coordinate = coordinates[i];

                if (is3d) {
                    // in case 3d mode is active add altitude value to coordinate
                    coordinate.push(10000);
                }

                coords.push(coordinate);
            }
            return new Polygon([coords]);
        }
        return undefined;
    };

    // First try to use the clip polygon as a geometry. As an alternative try to use the geometry attribute
    // In bothe cases the geometry attribute has to be deleted from the record afterward for proper working of the
    // following code
    let geometry =
        "geometry" in record
            ? readGeometry(
                  record["geometry"]["coordinates"][0],
                  record["geometry"]["type"]
              )
            : undefined;
    delete record["geometry"];

    // create feature and append properties
    const feature = new Feature({
        geometry: geometry,
    });

    for (let key in record) {
        if (Object.hasOwn(record, key)) {
            if (key === "time_published") {
                // parse time value in old format
                const timeValue = record[key].split("-")[0];
                feature.set(key, timeValue);
            } else {
                feature.set(key, record[key]);
            }
        }
    }

    feature.set("id", id);
    feature.setId(id);
    return feature;
};

/**
 * Function parses an array of search record from an elasticsearch query into
 * an ol object.
 *
 * @static
 * @param {Array.<Object>} records
 * @param {boolean} is3d
 * @return {Array.<ol.Feature>}
 */
export const readFeatures = function (records, is3d) {
    const features = [];
    for (let i = 0, ii = records.length; i < ii; i++) {
        features.push(
            readFeature(records[i]["_id"], records[i]["_source"], is3d)
        );
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
