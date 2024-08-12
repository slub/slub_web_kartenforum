/**
 * Created by jacob.mendt@pikobytes.de on 05.06.23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";
import SettingsProvider from "../../../SettingsProvider.js";
import { getDefaultMapMetadata } from "./defaultMapMetaData.js";
import { Response } from "./util.js";

/**
 * Check if the provided error is unexpected. That means it is an axios response error with an error.response.status property greather than 404 or any other error.
 */
function hasUnexpectedErrorStatusCode(error) {
    const isAxiosResponseError = error.response || false;
    const isAxiosResponseErrorSmallerOrEqualThan404 =
        error.response && error.response.status <= 404;

    if (isAxiosResponseError && isAxiosResponseErrorSmallerOrEqualThan404) {
        return false;
    }

    return true;
}

/**
 * This function makes sure, that we do not handle properties keys from the server response, which are currently not supported
 * by the client.
 */
function cleanServerMetadata(newMapMetadata) {
    const newObject = {};

    Object.keys(getDefaultMapMetadata()).forEach((key) => {
        if (newMapMetadata[key] !== undefined) {
            newObject[key] = newMapMetadata[key];
        }
    });

    return newObject;
}

/**
 * This function makes sure that we remove values from the map metadata, which value is null
 */
function cleanClientMetadata(newMapMetadata) {
    const o = {};
    Object.keys(newMapMetadata).forEach((key) => {
        if (newMapMetadata[key] !== null) {
            o[key] = newMapMetadata[key];
        }
    });
    return o;
}

/**
 * Deletes a map for a given map id
 */
export async function deleteMapForMapId(mapId) {
    try {
        const baseUrl = SettingsProvider.getSettings().API_GEOREFERENCE_MAP;

        if (baseUrl === undefined) {
            throw new Error("The url for the map upload endpoint is not set.");
        }

        // Build url and query it
        const options = { withCredentials: true };
        const url = `${baseUrl}/maps/${mapId}`;
        await axios.delete(url, options);

        return Response.ok(true);
    } catch (error) {
        if (hasUnexpectedErrorStatusCode(error)) {
            console.error(error);
        }

        return Response.error(error);
    }
}

/**
 * Queries a map for a specific map id and returns the json body.
 */
export async function readMapForMapId(mapId) {
    try {
        const baseUrl = SettingsProvider.getSettings().API_GEOREFERENCE_MAP;

        if (baseUrl === undefined) {
            throw new Error("The url for the map upload endpoint is not set.");
        }

        // Build url and query it
        const options = { withCredentials: true };
        const url = `${baseUrl}/maps/${mapId}`;
        const response = await axios.get(url, options);

        // TODO check if this is still a realistic error scenario
        if (response.data.map_id !== mapId) {
            const errorMsg =
                "The map id from the server does not match the given map id.";
            throw new Error(errorMsg);
        }

        const cleanedMetadata = cleanServerMetadata(response.data);
        return Response.ok(cleanedMetadata);
    } catch (error) {
        if (hasUnexpectedErrorStatusCode(error)) {
            console.error(error);
        }

        return Response.error(error);
    }
}

export async function createNewMap(mapMetadata, mapImageFile) {
    try {
        const baseUrl = SettingsProvider.getSettings().API_GEOREFERENCE_MAP;

        if (baseUrl === undefined) {
            throw new Error("The url for the map upload endpoint is not set.");
        }

        // Create FormData
        const formData = new FormData();

        if (mapMetadata !== undefined && mapImageFile !== null) {
            formData.append(
                "metadata",
                JSON.stringify(cleanClientMetadata(mapMetadata))
            );
            formData.append("file", mapImageFile);
        } else {
            const errorMsg =
                "Either the map metadata or the map image file is not set.";

            throw new Error(errorMsg);
        }

        // Build url and query it
        const options = {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        const url = `${baseUrl}/maps/`;
        const response = await axios.post(url, formData, options);
        const coercedMapId = "" + response.data.map_id;

        return Response.ok(coercedMapId);
    } catch (error) {
        if (hasUnexpectedErrorStatusCode(error)) {
            console.error(error);
        }

        return Response.error(error);
    }
}

export async function updateMap(mapId, mapMetadata, mapImageFile) {
    try {
        const baseUrl = SettingsProvider.getSettings().API_GEOREFERENCE_MAP;

        if (baseUrl === undefined) {
            throw new Error("The url for the map upload endpoint is not set.");
        }

        // Create FormData
        const formData = new FormData();

        if (mapMetadata !== null) {
            formData.append(
                "metadata",
                JSON.stringify(cleanClientMetadata(mapMetadata))
            );
        }

        if (mapImageFile !== null) {
            formData.append("file", mapImageFile);
        }

        // Build url and query it
        const options = {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        const url = `${baseUrl}/maps/${mapId}`;
        const response = await axios.post(url, formData, options);

        return Response.ok(response.data.map_id);
    } catch (error) {
        if (hasUnexpectedErrorStatusCode(error)) {
            console.error(error);
        }

        return Response.error(error);
    }
}
