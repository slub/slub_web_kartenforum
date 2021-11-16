/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";
import SettingsProvider from "../SettingsProvider";

function checkIfIndexIsMissing() {
    if (SettingsProvider.getSettings().API_SEARCH === undefined) {
        throw new Error("There is no search index defined.");
    }
}

/**
 * The function queries the search index for a specific document id and returns the json body.
 * @param {int|string} documentId
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function queryDocument(documentId) {
    checkIfIndexIsMissing();

    // Build url and query it
    const response = await axios.get(
        `${SettingsProvider.getSettings().API_SEARCH}/_doc/${documentId}`
    );

    if (response.status === 200) {
        return response.data._source;
    } else {
        console.error(
            "Something went wrong while trying to fetch search document."
        );
        return undefined;
    }
}
