/**
 * Created by jacob.mendt@pikobytes.de on 14.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";
import { WMSCapabilities } from "ol/format";

/**
 * Function checks if it is a valid url
 * @param {string} string
 * @returns {boolean}
 */
export function isValidUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * Parsing function for the wms capabilities
 *
 * @param {string} url
 * @param {*} capabilities
 * @returns {[{
 *     id: string,
 *     label: string,
 *     urls: string[],
 *     type: string,
 *     layers: string,
 *     tileSize: number
 * }]}
 */
function parseLayerFromCapabilities(url, capabilities) {
    return capabilities.Capability.Layer.Layer.filter((l) =>
        l.CRS.includes("EPSG:3857")
    ).map((l) => {
        return {
            id: l.Title,
            label: l.Title,
            urls: [url],
            type: "wms",
            layers: l.Name,
            tileSize: 512,
        };
    });
}

/**
 * Tries to fetch and parse a wms capabilities document
 * @param {string} url
 * @param {Function} onSuccess
 * @param {Function} onError
 * @returns {Promise<void>}
 */
export async function fetchAndParseWmsCapabilities(url, onSuccess, onError) {
    try {
        const response = await axios.get(url);

        // In case it is valid request we try to parse the capabilities document
        if (response.status === 200) {
            const capabilities = new WMSCapabilities().read(response.data);
            const layers = parseLayerFromCapabilities(
                url.split("?")[0],
                capabilities
            );
            onSuccess(layers);
            return;
        }
        throw new Error("Unknown error");
    } catch (e) {
        onError(
            `"${e.message}". Something went wrong while trying to fetch the wms capabilities. Please check the url or contact an administrator.`
        );
    }
}
