/**
 * Created by nicolas.looschen@pikobytes.de on 02.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export const getLayers = (map) => {
    const layers = map.getStyle().layers;
    return layers.filter(
        (layer) => layer?.metadata?.["vkf:allowUseInLayerManagement"]
    );
};

export const removeLayerForFeature = (map, feature) => {
    const sourceId = feature.getSourceId();

    removeLayer(map, sourceId);
};

export const removeLayer = (map, id) => {
    if (map.getLayer(id)) map.removeLayer(id);

    if (map.getSource(id)) map.removeSource(id);
};

export const getIndexToLayer = (map, layer) => {
    const layers = getLayers(map);
    return layers.findIndex((lay) => lay.id === layer.id);
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
