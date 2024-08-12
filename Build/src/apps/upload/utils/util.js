/**
 * Created by pouria.rezaei@pikobytes.de on 02.08.2023
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

//  This function makes sure that the given input data object is valid with the remote data schema.
export const getCleanMapMetadata = (data) => {
    const metadata = {};

    // Preprocess and sort the input data
    Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
            if (key === "time_of_publication") {
                metadata[key] = `${data[key]}-01-01T00:00:00`;
            } else if (key === "map_scale") {
                metadata[key] = Number(data[key]);
            } else if (key === "allow_download") {
                metadata[key] = data[key] === "true";
            } else {
                metadata[key] = data[key];
            }
        }
    });

    return metadata;
};

//  This function checks if the metadata is changed
export const areMetadataPropertiesDistinct = (newMetadata, mapMetadata) => {
    const newKeys = Object.keys(newMetadata);
    const mapKeys = Object.keys(mapMetadata);

    if (newKeys.length !== mapKeys.length) {
        return true;
    }

    for (const key of newKeys) {
        if (newMetadata[key] !== mapMetadata[key]) {
            return true;
        }
    }
    return false;
};

// this function used to find errors in the input fields
export const findInputError = (errors, name) => {
    return Object.keys(errors)
        .filter((key) => key.includes(name))
        .reduce((cur, key) => {
            return Object.assign(cur, { error: errors[key] });
        }, {});
};

/**
 * A utility object/pseudo class to facilitate the creation of a common object for error and successful responses.
 * Contains two static methods ok(data) and error(error).
 */
export const Response = {
    /**
     * Returns a response object with the data attribute set. Error and httpErrorStatusCode are set to null.
     */
    ok: (data) => ({
        data: data,
        error: null,
        httpErrorStatusCode: null,
    }),

    /**
     * Returns an error response object with the data attribute set to null. The error parameter must be set to an error object.
     * If the error object has the shape of an axios error and contains an error.response.status property, the httpStatusCode will be set accordingly.
     * Otherwise a default httpStatusCode of 999 is provided signalling an unexpected error.
     */
    error: (error) => {
        let httpErrorStatusCode = 999;

        const hasAxiosErrorStausCode = error.response && error.response.status;
        if (hasAxiosErrorStausCode) {
            httpErrorStatusCode = error.response.status;
        }

        return {
            data: null,
            error,
            httpErrorStatusCode,
        };
    },
};
