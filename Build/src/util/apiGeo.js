/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    // Build url and query it
    const path = "/statistics/";
    const response = await georeferenceApi.get(path);

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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    // Build url and query it
    const path = `/transformations/`;
    const queryParams = {
        map_id: mapId,
        additional_properties: true,
    };
    const response = await georeferenceApi.get(path, { params: queryParams });

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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    const path = "/transformations/";
    const queryParams = {
        user_id: userId,
    };

    // Build url and query it
    const response = await georeferenceApi.get(path, { params: queryParams });

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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    const path = "/transformations/";
    const queryParams = {
        validation,
    };

    // Build url and query it
    const response = await georeferenceApi.get(path, { params: queryParams });

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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    const path = "/jobs/";
    const payload = params;

    // Build url and query it
    const response = await georeferenceApi.post(path, payload);

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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    const path = "/transformations/";
    const queryParams = {
        dry_run: false,
    };
    const payload = { ...params, map_id: mapId };

    // Build url and query it
    const response = await georeferenceApi.post(path, payload, {
        params: queryParams,
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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    const path = "/transformations/";
    const payload = Object.assign(
        {
            map_id: mapId,
            params: params,
            overwrites: 0,
        },
        clip !== undefined ? { clip: clip } : {}
    );
    const queryParams = {
        dry_run: true,
    };

    // Build url and query it
    const response = await georeferenceApi.post(path, payload, {
        params: queryParams,
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

export async function queryTransformationPreview(transformationId) {
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    const path = "/transformations/";
    const payload = {
        transformation_id: transformationId,
    };
    const queryParams = {
        dry_run: true,
    };
    // Build url and query it
    const response = await georeferenceApi.post(path, payload, {
        params: queryParams,
    });

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to fetch transformation preview for given transformation_id."
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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    // Build url and query it
    const path = "/user/history/";
    const response = await georeferenceApi.get(path);

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to fetch the user history from the georeference endpoint."
        );
        return undefined;
    }
}
