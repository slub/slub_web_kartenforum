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
export const setLayersToInitialState = (sortedLayers) => {
    for (let key in sortedLayers) {
        if (Object.prototype.hasOwnProperty.call(sortedLayers, key)) {
            const layersArr = sortedLayers[key];

            layersArr.forEach((layer) => {
                layer.setOpacity(0);
                layer.setVisible(true);
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
        if (a.getTime() > b.getTime()) {
            return 1;
        }
        if (a.getTime() < b.getTime()) {
            return -1;
        }
        return 0;
    });

    const responseObj = {};
    sortedLayers.forEach((layer) => {
        // update layer order on map
        map.removeLayer(layer);
        map.addLayer(layer);

        // build responseObj
        const layerTime = layer.getTime();
        if (layerTime in responseObj) {
            responseObj[layerTime].push(layer);
        } else {
            responseObj[layerTime] = [layer];
        }
    });

    return responseObj;
};
