/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { transform } from "ol/proj";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { isDefined } from "./util";
import { MAP_PROJECTION } from "../components/MapSearch/MapSearch";

/**
 * Function parses a search record from a elasticsearch query into
 * an ol object.
 *
 * @static
 * @param {string} id
 * @param {Object} record
 * @param {string=} opt_source_projection
 * @param {string=} opt_target_projection
 * @param {boolean} is3d
 * @return {ol.Feature}
 */
export const readFeature = function (
    id,
    record,
    opt_source_projection,
    opt_target_projection,
    is3d
) {
    /**
     * @type {string}
     * @private
     */
    const sourceProjection_ = isDefined(opt_source_projection)
        ? opt_source_projection
        : "EPSG:4326";

    /**
     * @type {string}
     * @private
     */
    const targetProjection_ = isDefined(opt_target_projection)
        ? opt_target_projection
        : MAP_PROJECTION;

    /**
     * Functions parse the geometry of the search record.
     *
     * - Function supports right now only simple polygons. No MultiPolygons.
     * @param {Array.<number>} coordinates
     * @param {string} type
     * @param {string} sourceProjection (should be something like 'EPSG:4326')
     * @param {string} targetPojection (should be something like 'EPSG:3857')
     * @return {ol.geom.Geometry|undefined}
     */
    const readGeometry = function (
        coordinates,
        type,
        sourceProjection,
        targetProjection
    ) {
        if (type.toLowerCase() === "polygon") {
            // parse polygon
            const coords = [];
            for (let i = 0, ii = coordinates.length; i < ii; i++) {
                // transform coordinates in correct projection
                const coordinate = transform(
                    coordinates[i],
                    sourceProjection,
                    targetProjection
                );

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
    // In bothe cases the geometry attribute has to be deleted from the record afterwards for proper working of the
    // following code
    let geometry =
        "clippolygon" in record
            ? readGeometry(
                  record["clippolygon"],
                  "polygon",
                  sourceProjection_,
                  targetProjection_
              )
            : undefined;
    geometry =
        geometry === undefined && "geometry" in record
            ? readGeometry(
                  record["geometry"]["coordinates"][0],
                  record["geometry"]["type"],
                  sourceProjection_,
                  targetProjection_
              )
            : geometry;
    delete record["geometry"];

    // create feature and append properties
    const feature = new Feature({
        geometry: geometry,
    });

    for (let key in record) {
        if (record.hasOwnProperty(key)) {
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
 * Function parses a array of search record from a elasticsearch query into
 * an ol object.
 *
 * @static
 * @param {Array.<Object>} records
 * @return {Array.<ol.Feature>}
 */
export const readFeatures = function (records, srs_proj, trg_proj, is3d) {
    const features = [];
    for (let i = 0, ii = records.length; i < ii; i++) {
        features.push(
            readFeature(
                records[i]["_id"],
                records[i]["_source"],
                srs_proj,
                trg_proj,
                is3d
            )
        );
    }

    return features;
};
