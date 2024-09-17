/**
 * Created by nicolas.looschen@pikobytes.de on 24.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { queryDocument } from "../../../util/apiEs.js";
import { readFeature } from "../../../util/parser.js";

/**
 * Fetches a feature based on a map id and parses it
 * @param mapId
 * @param is3dEnabled
 * @return {Promise<ol.Feature>}
 */
export const fetchFeatureForMapId = (mapId) =>
    queryDocument(mapId)
        .then((res) => readFeature(mapId, res))
        .catch(() => {
            //@TODO: Add missing feature to new abstraction
            // const feature = new Feature({
            //     id: mapId,
            //     isMissing: true,
            //     has_georeference: false,
            // });
            // feature.setId(mapId);
            // return feature;

            return null;
        });
