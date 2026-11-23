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
                layer.setOpacity(map, 0);
                layer.setVisibility(map, "visible");
            });
        }
    }
};

/**
 * Layers with an open start (unknown creation date) have no sort time and are
 * left out of the animation.
 * @param layer
 * @return {boolean}
 */
export const isExcludedFromAnimation = (layer) => layer.getSortTime() === null;

/**
 * Sort layers depending on time and rearrange the layer stack on the map accordingly.
 * Layers without a sort time (open start) are sorted last.
 * @param layers
 * @return {layers[]}
 */
export const sortLayers = (layers) => {
    return layers.slice().sort((a, b) => {
        const sortTimeA = a.getSortTime();
        const sortTimeB = b.getSortTime();

        // layers may have unbounded time periods in one direction
        if (sortTimeA === null || sortTimeB === null) {
            if (sortTimeA === sortTimeB) {
                return 0;
            }

            return sortTimeA === null ? 1 : -1;
        }

        if (sortTimeA > sortTimeB) {
            return 1;
        }
        if (sortTimeA < sortTimeB) {
            return -1;
        }
        return 0;
    });
};

export const groupLayers = (sortedLayers, map) => {
    const responseObj = {};
    sortedLayers.forEach((layer) => {
        // all layers are moved, so that the layer stack matches the sorted layer list
        layer.move(map, null);

        if (isExcludedFromAnimation(layer)) {
            return;
        }

        // build responseObj
        const layerTime = layer.getSortTime();
        if (layerTime in responseObj) {
            responseObj[layerTime].push(layer);
        } else {
            responseObj[layerTime] = [layer];
        }
    });

    return responseObj;
};
