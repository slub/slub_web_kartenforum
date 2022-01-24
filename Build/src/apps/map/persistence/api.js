/**
 * Created by nicolas.looschen@pikobytes.de on 24.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";
import { queryDocument } from "../../../util/apiEs.js";
import { readFeature } from "../../../util/parser.js";

/**
 * Fetches a feature based on a map id and parses it
 * @param mapId
 * @param is3dEnabled
 * @return {Promise<ol.Feature>}
 */
export const fetchFeatureForMapId = (mapId, is3dEnabled) =>
    queryDocument(mapId).then((res) =>
        readFeature(mapId, res, undefined, undefined, is3dEnabled)
    );

/**
 * Fetches a map view from the backend and returns the corresponding json
 * @param url
 * @return {Promise<Pick<unknown, number|symbol>>}
 */
export const fetchMapView = (url) => {
    return axios.get(url).then((res) => res.data.map_view_json);
};
