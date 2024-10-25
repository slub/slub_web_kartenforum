/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";
import SettingsProvider from "@settings-provider";

/**
 * The function queries the search index for a specific document id and returns the json body.
 * @param {int|string} documentId
 * @returns {Promise<{
 *     description: string,
 *     file_name: string,
 *     geometry: GeoJSON|null,
 *     has_georeference: boolean,
 *     keywords: string,
 *     map_id: string,
 *     map_scale: number,
 *     map_type: string,
 *     online_resources: { url: string, type: string }[],
 *     original_url: string,
 *     permalink: string,
 *     thumb_url: string,
 *     time_published: string,
 *     title: string,
 *     title_long: string,
 *     tms_url: string|null,
 *     zoomify_url: string
 * }>}
 */
export async function queryDocument(documentId) {
    const baseUrl = SettingsProvider.getSettings().API_SEARCH;

    if (baseUrl === undefined) {
        throw new Error("The url for the search endpoint is not set.");
    }

    // Build url and query it
    const response = await axios.get(`${baseUrl}/_doc/${documentId}`);

    if (response.status === 200) {
        return response.data._source;
    } else {
        console.error(
            "Something went wrong while trying to fetch search document."
        );
        return undefined;
    }
}

/**
 * The function queries the search index for all unreferenced documents and returns the json body.
 *
 * @params {number} maxFeatures
 * @returns {Promise<{
 *     description: string,
 *     file_name: string,
 *     geometry: GeoJSON|null,
 *     has_georeference: boolean,
 *     keywords: string,
 *     map_id: string,
 *     map_scale: number,
 *     map_type: string,
 *     online_resources: { url: string, type: string }[],
 *     original_url: string,
 *     permalink: string,
 *     thumb_url: string,
 *     time_published: string,
 *     title: string,
 *     title_long: string,
 *     tms_url: string|null,
 *     zoomify_url: string
 * }[]>}
 */
export async function queryUnreferencedDocuments(maxFeatures = 500) {
    const baseUrl = SettingsProvider.getSettings().API_SEARCH;

    if (baseUrl === undefined) {
        throw new Error("The url for the search endpoint is not set.");
    }

    // Build url and query it
    const response = await axios.post(
        `${baseUrl}/_search?size=${maxFeatures}`,
        { query: { term: { has_georeference: false } } }
    );

    if (response.status === 200 && response.data.hits.total.value > 0) {
        return response.data.hits.hits.map((d) => d._source);
    } else {
        console.error(
            "Something went wrong while trying to fetch search document."
        );
        return [];
    }
}
