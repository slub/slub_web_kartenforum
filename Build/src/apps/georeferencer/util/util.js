/**
 * Created by jacob.mendt@pikobytes.de on 14.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { boundingExtent } from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";

export const DEFAULT_PROJ = "EPSG:4326";

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
    const { params, clip } = transformation;
    const points = [
        ...params.gcps.map((gcp) => gcp.target),
        ...clip.coordinates[0],
    ];

    return points.length > 0 ? boundingExtent(points) : null;
}

/**
 * Parse a extent from a geojson object
 * @param {GeoJSONGeometry} geojsonPolygon
 * @returns {[number, number, number, number]}
 */
export function geoJsonExtentFromGeoJsonPolygon(geojsonPolygon) {
    const polygon = new GeoJSON().readGeometry(geojsonPolygon, {
        dataProjection: DEFAULT_PROJ,
        featureProjection: DEFAULT_PROJ,
    });

    return polygon.getExtent();
}
