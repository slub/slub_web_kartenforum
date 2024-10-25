/**
 * Created by jacob.mendt@pikobytes.de on 14.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from "axios";
import WMSCapabilities from "wms-capabilities";
export const WMS_LAYER_ID = "wms-base-map-layer";
export const WMS_SOURCE_ID = "wms-base-map-source";
export const XYZ_LAYER_ID = "xyz-base-map-layer";
export const XYZ_SOURCE_ID = "xyz-base-map-source";

/**
 * Function checks if it is a valid url
 * @param {string} string
 * @returns {boolean}
 */
export function isValidUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * Parsing function for the wms capabilities
 *
 * @param {string} url
 * @param {*} capabilities
 * @returns {[{
 *     id: string,
 *     label: string,
 *     urls: string[],
 *     type: string,
 *     layers: string,
 *     tileSize: number
 * }]}
 */
function parseLayerFromCapabilities(url, capabilities) {
    return capabilities.Capability.Layer.Layer.filter((l) =>
        l.CRS.includes("EPSG:3857")
    ).map((l) => {
        const tileSize = 512;
        const layerName = l.Name;
        return {
            id: l.Title,
            label: l.Title,
            // This request does not work with a WMS in version 1.1.0. The VKF WMS services also support version 1.1.0. Nevertheless
            // it could become a problem, if we need to support other WMS services in the future.
            urls: [`${url}?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.0&request=GetMap&srs=EPSG:3857&transparent=true&width=${tileSize}&height=${tileSize}&layers=${layerName}`],
            type: "wms",
            layers: layerName,
            tileSize: tileSize,
        };
    });
}

/**
 * Tries to fetch and parse a wms capabilities document
 * @param {string} url
 * @param {Function} onSuccess
 * @param {Function} onError
 * @returns {Promise<void>}
 */
export async function fetchAndParseWmsCapabilities(url) {
    const response = await axios.get(url);

    // In case it is valid request we try to parse the capabilities document
    if (response.status === 200) {
        const capabilities = new WMSCapabilities().parse(response.data);
        console.log(
            "parse",
            parseLayerFromCapabilities(url.split("?")[0], capabilities)
        );
        return parseLayerFromCapabilities(url.split("?")[0], capabilities);
    } else {
        throw new Error(`Could not fetch wms capabilities document at ${url}`);
    }
}

export const addWMSLayer = (map, baseMap, baseMapStyleLayers) => {
    if (!baseMap) return false;

    // First, hide vector base map layers
    hideVectorBaseMapLayer(map, baseMapStyleLayers);

    // Add the WMS source if it does not already exist
    if (!map.getSource(WMS_SOURCE_ID)) {
        // Add the WMS source
        const wmsSource = {
            type: "raster",
            tiles: [
                `${baseMap.urls[0]}?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=2.0.0&request=GetMap&CRS=EPSG:3857&transparent=true&width=512&height=512&layers=${baseMap.layers}&STYLES=`,
            ],
        };
        // Conditionally add attribution if it exists
        if (baseMap.attribution) {
            wmsSource.attribution = baseMap.attribution;
        }
        // Add the source to the map
        map.addSource(WMS_SOURCE_ID, wmsSource);

        const inbeforeLayer = map.getStyle().layers[0].id;

        map.addLayer(
            {
                id: WMS_LAYER_ID,
                type: "raster",
                source: WMS_SOURCE_ID,
                paint: {},
            },
            inbeforeLayer
        );
    }
};

export const showBaseMapLayers = (map) => {
    for (const { id } of map.getStyle().layers) {
        if (id === WMS_LAYER_ID || id === XYZ_LAYER_ID) {
            map.setLayoutProperty(id, "visibility", "visible");
        }
    }
};
export const removeWMSLayer = (map) => {
    showBaseMapLayers(map);
    if (map.getLayer(WMS_LAYER_ID)) {
        map.removeLayer(WMS_LAYER_ID);
    }
    if (map.getSource(WMS_SOURCE_ID)) {
        map.removeSource(WMS_SOURCE_ID);
    }
};

export const showVectorBaseMapLayer = (map, setLayoutProperty) => {
    setLayoutProperty.forEach((layer) => {
        map.setLayoutProperty(layer.id, "visibility", "visible");
    });
};

export const hideVectorBaseMapLayer = (map, baseMapStyleLayers) => {
    baseMapStyleLayers.forEach((layer) => {
        map.setLayoutProperty(layer.id, "visibility", "none");
    });
};

export const addXYZLayer = (map, baseMap, baseMapStyleLayers) => {
    if (!baseMap) return false;

    hideVectorBaseMapLayer(map, baseMapStyleLayers);
    removeWMSLayer(map);

    if (!map.getSource(XYZ_LAYER_ID)) {
        map.addSource(XYZ_SOURCE_ID, {
            type: "raster",
            tiles: [baseMap.urls[0]],
            attribution: baseMap.attribution,
        });
        const inbeforeLayer = map.getStyle().layers[0].id;

        map.addLayer(
            {
                id: XYZ_LAYER_ID,
                type: "raster",
                source: XYZ_SOURCE_ID,
                paint: {},
            },
            inbeforeLayer
        );
    }
};

export const removeXYZLayer = (map) => {
    showBaseMapLayers(map);
    if (map.getLayer(XYZ_LAYER_ID)) {
        map.removeLayer(XYZ_LAYER_ID);
    }
    if (map.getSource(XYZ_SOURCE_ID)) {
        map.removeSource(XYZ_SOURCE_ID);
    }
};
