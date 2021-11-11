/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";
import SettingsProvider from "../SettingsProvider";

function checkIfGeoServiceIsMissing() {
    if (
        SettingsProvider.getSettings()
            .API_GEOREFERENCE_TRANSFORMATION_BY_MAPID === undefined
    ) {
        throw new Error(
            "There is no georeference transformation endpoint defined."
        );
    }
}

/**
 * The function queries the transformation information for a given mapId and returns a json object
 * @param {int|string} mapId
 * @returns {Promise<{
 *     active_transformation_id: number|null,
 *     extent: GeoJSONGeometry,
 *     default_srs: string,
 *     items: {
 *       map_id: string,
 *       metadata: {
 *         time_published: string,
 *         title: string,
 *       },
 *       transformation: {
 *         clip: GeoJSONGeometry,
 *         overwrites: number,
 *         params: {
 *           source: string,
 *           target: string,
 *           algorithm: string,
 *           gcps: {
 *             source: [number,number],
 *             target: [number,number]
 *           }[]
 *         },
 *         submitted: string,
 *         transformation_id: number,
 *         user_id: string,
 *       }
 *     }[],
 *     map_id: string,
 *     metadata: {
 *       time_published: string,
 *       title: string,
 *     },
 *     pending_jobs: boolean,
 * }>}
 */
export async function queryTransformationForMapId(mapId) {
    checkIfGeoServiceIsMissing();

    // Build url and query it
    const response = await axios.get(
        `${
            SettingsProvider.getSettings()
                .API_GEOREFERENCE_TRANSFORMATION_BY_MAPID
        }&map_id=${mapId}`
    );

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to fetch transformation for given map_id."
        );
        return undefined;
    }
}
