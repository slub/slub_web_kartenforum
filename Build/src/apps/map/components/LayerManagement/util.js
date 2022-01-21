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

/**
 * Automatically downloads a json string as file
 * @param fileName - name of the file
 * @param jsonString - contents of the file
 */
export const triggerJsonDownload = (fileName, jsonString) => {
    // set file contents
    const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);

    // automatically trigger download
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${fileName}.json`);
    downloadAnchor.click();
};
