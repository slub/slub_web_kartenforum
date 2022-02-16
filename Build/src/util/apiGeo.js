/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";
import SettingsProvider from "../SettingsProvider";

/**
 * Queries the georeference endpoint for global statistics.
 *
 * @returns {Promise<{
 *     georeference_points: {
 *         user_id: string,
 *         total_points: number,
 *         transformation_new: number,
 *         transformation_updates: number
 *     }[],
 *     georeference_map_count: number,
 *     not_georeference_map_count: number,
 * }>}
 */
export async function queryStatistics() {
    const baseUrl = SettingsProvider.getSettings().API_GEOREFERENCE_STATISTICS;

    if (baseUrl === undefined) {
        throw new Error("The url for the statistics endpoint is not set.");
    }

    // Build url and query it
    const response = await axios.get(`${baseUrl}`);

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to fetch statistics from the georeference endpoint."
        );
        return undefined;
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
    const baseUrl =
        SettingsProvider.getSettings()
            .API_GEOREFERENCE_TRANSFORMATION_FOR_MAPID;

    if (baseUrl === undefined) {
        throw new Error("The url for the transformation endpoint is not set.");
    }

    // Build url and query it
    const response = await axios.get(`${baseUrl}&map_id=${mapId}`);

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to fetch transformation for given map_id."
        );
        return undefined;
    }
}

/**
 * The function queries the transformation information for a given mapId returns a json object
 * @param {string} userId
 * @returns {Promise<{
 *     is_active: boolean,
 *     validation: string,
 *     transformations: {
 *       map_id: string,
 *       metadata: {
 *         time_published: string,
 *         title: string,
 *         title_short: string,
 *       },
 *       clip: GeoJSONGeometry,
 *       overwrites: number,
 *       params: {
 *         source: string,
 *         target: string,
 *         algorithm: string,
 *         gcps: {
 *           source: [number,number],
 *           target: [number,number]
 *         }[]
 *       },
 *       submitted: string,
 *       transformation_id: number,
 *       user_id: string,
 *       validation: string
 *     }[],
 * }>}
 */
export async function queryTransformationForUserId(userId) {
    const baseUrl =
        SettingsProvider.getSettings()
            .API_GEOREFERENCE_TRANSFORMATION_FOR_USERID;

    if (baseUrl === undefined) {
        throw new Error("The url for the transformation endpoint is not set.");
    }

    // Build url and query it
    const response = await axios.get(`${baseUrl}&user_id=${userId}`);

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to fetch transformation for given user id."
        );
        return undefined;
    }
}

/**
 * The function queries the transformation information for a given validation value and returns a json object
 * @param {string} validation [missing|invalid|valid]
 * @returns {Promise<{
 *     is_active: boolean,
 *     validation: string,
 *     transformations: {
 *       map_id: string,
 *       metadata: {
 *         time_published: string,
 *         title: string,
 *         title_short: string,
 *       },
 *       clip: GeoJSONGeometry,
 *       overwrites: number,
 *       params: {
 *         source: string,
 *         target: string,
 *         algorithm: string,
 *         gcps: {
 *           source: [number,number],
 *           target: [number,number]
 *         }[]
 *       },
 *       submitted: string,
 *       transformation_id: number,
 *       user_id: string,
 *       validation: string
 *     }[],
 * }>}
 */
export async function queryTransformationForValidation(validation) {
    const baseUrl =
        SettingsProvider.getSettings()
            .API_GEOREFERENCE_TRANSFORMATION_FOR_VALIDATION;

    if (baseUrl === undefined) {
        throw new Error("The url for the transformation endpoint is not set.");
    }

    // Build url and query it
    const response = await axios.get(`${baseUrl}&value=${validation}`);

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to fetch transformation for given validation."
        );
        return undefined;
    }
}

/**
 * POST a new job
 * @param {{
 *  task_name: string,
 *  task: {
 *    comment: string,
 *    transformation_id: number
 *  }
 * }} params
 * @returns {Promise<undefined|any>}
 */
export async function postJob(params) {
    const baseUrl = SettingsProvider.getSettings().API_GEOREFERENCE_JOB;

    if (baseUrl === undefined) {
        throw new Error("The url for the transformation endpoint is not set.");
    }

    // The TYPO3 proxy expects form data
    const newForm = new FormData();
    newForm.append("req", JSON.stringify(params));

    // Build url and query it
    const response = await axios.post(`${baseUrl}`, newForm, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
    });

    if (response.status === 200) {
        return response.data;
    } else {
        console.error("Something went wrong while trying to post a new job.");
        return undefined;
    }
}

/**
 * POST a new transformation process.
 * @param {string} mapId
 * @param {{
 *  clip: GeoJSON,
 *  params: {
 *    source: string,
 *    target: string,
 *    algorithm: string,
 *    gcps: {
 *      source: [number,number],
 *      target: [number,number]
 *    }[]
 *  },
 *  overwrites: number,
 * }} params
 * @returns {Promise<undefined|any>}
 */
export async function postTransformation(mapId, params) {
    const baseUrl =
        SettingsProvider.getSettings().API_GEOREFERENCE_TRANSFORMATION_CONFIRM;

    if (baseUrl === undefined) {
        throw new Error("The url for the transformation endpoint is not set.");
    }

    // The TYPO3 proxy expects form data
    const newForm = new FormData();
    newForm.append("req", JSON.stringify(params));

    // Build url and query it
    const response = await axios.post(`${baseUrl}&map_id=${mapId}`, newForm, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
    });

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to confirm transformation for given map_id and params."
        );
        return undefined;
    }
}

/**
 * Fetches a rectified image for a given map_id and params
 * @param {string} mapId
 * @param {{
 *  source: string,
 *  target: string,
 *  algorithm: string,
 *  gcps: {
 *    source: [number,number],
 *    target: [number,number]
 *  }[]
 * }} params
 * @param {GeoJSON|undefined} clip
 * @returns {Promise<undefined|any>}
 */
export async function queryTransformationTry(mapId, params, clip) {
    const baseUrl =
        SettingsProvider.getSettings().API_GEOREFERENCE_TRANSFORMATION_TRY;

    if (baseUrl === undefined) {
        throw new Error("The url for the transformation endpoint is not set.");
    }

    // The TYPO3 proxy expects form data
    const pureRequest = Object.assign(
        {
            map_id: mapId,
            params: params,
        },
        clip !== undefined ? { clip: clip } : {}
    );

    const newForm = new FormData();
    newForm.append("req", JSON.stringify(pureRequest));

    // Build url and query it
    const response = await axios.post(`${baseUrl}`, newForm, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
    });

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to fetch transformation for given map_id and params."
        );
        return undefined;
    }
}

/**
 * Queries the user history for a given user.
 *
 * @returns {Promise<{
 *     georef_profile: {
 *         file_name: string,
 *         is_transformed: boolean,
 *         map_id: string,
 *         metadata: {
 *             thumbnail: string,
 *             time_published: string,
 *             title: string,
 *         },
 *         transformation: {
 *             id: number,
 *             submitted: string,
 *             validation: invalid,
 *         }
 *     }[],
 *     points: number,
 * }>}
 */
export async function queryUserHistory() {
    const baseUrl =
        SettingsProvider.getSettings().API_GEOREFERENCE_USER_HISTORY;

    if (baseUrl === undefined) {
        throw new Error("The url for the user history endpoint is not set.");
    }

    // Build url and query it
    const response = await axios.get(`${baseUrl}`);

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to fetch the user history from the georeference endpoint."
        );
        return undefined;
    }
}
