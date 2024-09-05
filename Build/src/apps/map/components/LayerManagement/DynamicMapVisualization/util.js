/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * Resets visibility of layers to a clean state
 * @param sortedLayers
 */
export const setLayersToInitialState = (sortedLayers, map) => {
    for (let key in sortedLayers) {
        if (Object.prototype.hasOwnProperty.call(sortedLayers, key)) {
            const layersArr = sortedLayers[key];

            layersArr.forEach((layer) => {
                map.setPaintProperty(layer.id, "raster-opacity", 0);
                map.setLayoutProperty(layer.id, "visibility", "visible");
            });
        }
    }
};

/**
 * Sort layers depending on time and rearrange the layer stack on the map accordingly
 * @param layers
 * @param map
 * @return {{[number]: layers[]}}
 */
export const sortLayers = (layers, map) => {
    const sortedLayers = layers.sort((a, b) => {
        const timePublishedA = a.metadata["vkf:time_published"];
        const timePublishedB = b.metadata["vkf:time_published"];

        if (timePublishedA > timePublishedB) {
            return 1;
        }
        if (timePublishedA < timePublishedB) {
            return -1;
        }
        return 0;
    });

    const responseObj = {};
    sortedLayers.forEach((layer) => {
        map.moveLayer(layer.id, null);

        // build responseObj
        const layerTime = layer.metadata["vkf:time_published"];
        if (layerTime in responseObj) {
            responseObj[layerTime].push(layer);
        } else {
            responseObj[layerTime] = [layer];
        }
    });

    return responseObj;
};
