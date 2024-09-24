/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { METADATA } from "../../CustomLayers/GeoJsonLayer/constants.js";

/**
 * Resets visibility of layers to a clean state
 * @param sortedLayers
 */
export const setLayersToInitialState = (sortedLayers, map) => {
    for (let key in sortedLayers) {
        if (Object.prototype.hasOwnProperty.call(sortedLayers, key)) {
            const layersArr = sortedLayers[key];

            layersArr.forEach((layer) => {
                layer.setOpacity(map, 0);
                layer.setVisibility(map, "visible");
            });
        }
    }
};

/**
 * Sort layers depending on time and rearrange the layer stack on the map accordingly
 * @param layers
 * @return {layers[]}
 */
export const sortLayers = (layers) => {
    return layers.slice().sort((a, b) => {
        const timePublishedA = a.getMetadata(METADATA.timePublished);
        const timePublishedB = b.getMetadata(METADATA.timePublished);

        if (timePublishedA > timePublishedB) {
            return 1;
        }
        if (timePublishedA < timePublishedB) {
            return -1;
        }
        return 0;
    });
};

export const groupLayers = (sortedLayers, map) => {
    const responseObj = {};
    sortedLayers.forEach((layer) => {
        layer.move(map, null);

        // build responseObj
        const layerTime = layer.getMetadata(METADATA.timePublished);
        if (layerTime in responseObj) {
            responseObj[layerTime].push(layer);
        } else {
            responseObj[layerTime] = [layer];
        }
    });

    return responseObj;
};
