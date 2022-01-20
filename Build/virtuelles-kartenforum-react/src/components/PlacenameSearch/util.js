/**
 * Created by nicolas.looschen@pikobytes.de on 03/12/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";

/**
 * @param {string} url
 * @param {string} placename
 * @param {function} loadingFinishedCallback - called on load success
 *
 * @return {Promise} promise returning the parsed Data
 */
export const requestPlacenameData = (
    url,
    placename,
    loadingFinishedCallback
) => {
    const request_url = url + "?format=json&q=" + placename;

    return axios.get(request_url).then((response) => {
        const data = response.data;
        const parsedData = data.map((feature) => ({
            label: feature["display_name"],
            value: feature["display_name"],
            lonlat: {
                x: parseFloat(feature["lon"]),
                y: parseFloat(feature["lat"]),
            },
            type: feature["type"],
        }));

        if (loadingFinishedCallback !== undefined) {
            loadingFinishedCallback();
        }
        return parsedData;
    });
};
