/**
 * Created by nicolas.looschen@pikobytes.de on 02.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export const getLayers = (map) => {
    const layers = map.getLayers();
    const allLayers = layers.getArray();
    const l = [];
    allLayers.forEach((layer) => {
        if (layer.allowUseInLayerManagement) {
            l.push(layer);
        }
    });
    return l;
};

export const getIndexToLayer = (map, layer) => {
    const layers = map.getLayers();
    const l = layers.getArray();
    return l.findIndex((lay) => lay === layer);
};
