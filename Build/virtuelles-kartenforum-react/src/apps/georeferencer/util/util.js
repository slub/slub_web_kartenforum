/**
 * Created by jacob.mendt@pikobytes.de on 14.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { initializeSupportedCRS } from "../../../util/geo";
import { boundingExtent } from "ol/extent";
import { toLonLat } from "ol/proj";
import GeoJSON from "ol/src/format/GeoJSON";

/**
 * Extracts a extent from a given transformation. The extent is always computed in EPSG:4326
 * @param {{
 *     params: {
 *       clip: GeoJSONGeometry,
 *       params: {
 *         source: string,
 *         target: string,
 *         algorithm: string,
 *         gcps: {
 *           source: [number,number],
 *           target: [number,number]
 *         }[]
 *       }
 *     }
 * }} transformation
 * @returns {[number, number, number, number]}
 */
export function geoJsonExtentFromTransformation(transformation) {
    initializeSupportedCRS();

    const { params, clip } = transformation;
    let points = [];

    // Transform gcp target points to LonLat points
    if (params.gcps.length > 0) {
        const targetSrs = params.target;
        points = [...params.gcps.map((gcp) => toLonLat(gcp.target, targetSrs))];
    }

    // Transform clip points to LonLat Points
    if (clip !== null && clip !== undefined) {
        const targetSrs =
            clip.crs !== undefined ? clip.crs.properties.name : "EPSG:4326";
        points = [
            ...points,
            clip.coordinates[0].map((c) =>
                targetSrs !== "EPSG:4326" ? toLonLat(c, targetSrs) : c
            ),
        ];
    }

    return points.length > 0 ? boundingExtent(points) : null;
}

/**
 * Parse a extent from a geojson object
 * @param {GeoJSONGeometry} geojsonPolygon
 * @returns {[number, number, number, number]}
 */
export function geoJsonExtentFromGeoJsonPolygon(geojsonPolygon) {
    initializeSupportedCRS();

    const targetSrs =
        geojsonPolygon.crs !== undefined
            ? geojsonPolygon.crs.properties.name
            : "EPSG:4326";
    const polygon = new GeoJSON().readGeometry(geojsonPolygon, {
        dataProjection: targetSrs,
        featureProjection: "EPSG:4326",
    });
    return polygon.getExtent();
}
