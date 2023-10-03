/**
 * Created by jacob.mendt@pikobytes.de on 05.06.23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";
import SettingsProvider from "../../../SettingsProvider.js";
import { getDefaultMapMetadata } from "./defaultMapMetaData.js";

const dummy_username = "";
const dummy_password = "";

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
export async function deleteMapForMapId(
    mapId,
    username = dummy_username,
    password = dummy_password
) {
    try {
        const baseUrl = SettingsProvider.getSettings().API_GEOREFERENCE_MAP;

        if (baseUrl === undefined) {
            throw new Error("The url for the map upload endpoint is not set.");
        }

        // Build url and query it
        const response = await axios.delete(`${baseUrl}/maps/${mapId}`, {
            auth: {
                username: username,
                password: password,
            },
        });

        if (response.status === 200) {
            return true;
        } else {
            console.error(
                "Something went wrong while trying to delete map id."
            );
            return null;
        }
    } catch (e) {
        console.log(
            "Something unexpected occurred while trying to delete map id."
        );
        console.error(e);
        return null;
    }
}

/**
 * Queries a map for a specific map id and returns the json body.
 */
export async function readMapForMapId(
    mapId,
    username = dummy_username,
    password = dummy_password
) {
    try {
        const baseUrl = SettingsProvider.getSettings().API_GEOREFERENCE_MAP;

        if (baseUrl === undefined) {
            throw new Error("The url for the map upload endpoint is not set.");
        }

        // Build url and query it
        const response = await axios.get(`${baseUrl}/maps/${mapId}`, {
            auth: {
                username: username,
                password: password,
            },
        });

        if (response.status === 200) {
            if (response.data.map_id !== mapId) {
                console.error(
                    "The map id from the server does not match the given map id."
                );
                return null;
            }

            return cleanServerMetadata(response.data);
        } else {
            console.error("Something went wrong while trying to fetch map id.");
            return null;
        }
    } catch (e) {
        console.log(
            "Something unexpected occurred while trying to fetch map id."
        );
        console.error(e);
        return null;
    }
}

export async function createNewMap(
    mapMetadata,
    mapImageFile,
    username = dummy_username,
    password = dummy_password
) {
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
            console.error(
                "Either the map metadata or the map image file is not set."
            );
            return null;
        }

        // Build url and query it
        const response = await axios.post(
            `${baseUrl}/maps/?user_id=${SettingsProvider.getUsername()}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                auth: {
                    username: username,
                    password: password,
                },
            }
        );

        if (response.status === 200) {
            return response.data.map_id;
        } else {
            console.error(
                "Something went wrong while trying to post new data."
            );
            return null;
        }
    } catch (e) {
        console.log(
            "Something unexpected occurred while trying to fetch map id."
        );
        console.error(e);
        return null;
    }
}

export async function updateMap(
    mapId,
    mapMetadata,
    mapImageFile,
    username = dummy_username,
    password = dummy_password
) {
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
        const response = await axios.post(
            `${baseUrl}/maps/${mapId}?user_id=test_user`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                auth: {
                    username: username,
                    password: password,
                },
            }
        );

        if (response.status === 200) {
            console.log(response.data);
            return response.data.map_id;
        } else {
            console.error(
                "Something went wrong while trying to post new data."
            );
            return null;
        }
    } catch (e) {
        console.log(
            "Something unexpected occurred while trying to fetch map id."
        );
        console.error(e);
        return null;
    }
}

export async function testCredentials(username, password) {
    try {
        const baseUrl = SettingsProvider.getSettings().API_GEOREFERENCE_MAP;

        if (baseUrl === undefined) {
            throw new Error("The url for the credentials endpoint is not set.");
        }

        // Build url and query it
        const response = await axios.get(`${baseUrl}/statistics`, {
            auth: {
                username: username,
                password: password,
            },
        });

        if (response.status === 200) {
            return {
                credentialsValid: true,
                msg: "Credentials are valid.",
                status: response.status,
            };
        } else if (response.status === 401) {
            return {
                credentialsValid: false,
                msg: "Credentials are not valid.",
                status: response.status,
            };
        } else {
            return {
                credentialsValid: false,
                msg: "Unknown error.",
                status: response.status,
            };
        }
    } catch (e) {
        console.log(
            "Something unexpected occurred while trying to fetch map id."
        );
        console.error(e);
        return {
            credentialsValid: false,
            msg: "Unknown error.",
            status: null,
        };
    }
}
