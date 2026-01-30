/**
 * Created by jacob.mendt@pikobytes.de on 14.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { isDefined } from "@util/util";
import axios from "axios";
import WMSCapabilities from "wms-capabilities";
export const WMS_LAYER_ID = "wms-base-map-layer";
export const WMS_SOURCE_ID = "wms-base-map-source";
export const XYZ_LAYER_ID = "xyz-base-map-layer";
export const XYZ_SOURCE_ID = "xyz-base-map-source";

const WMS_VERSION = {
    "1.0.0": "1.0.0",
    "1.1.0": "1.1.0",
    "1.1.1": "1.1.1",
    "1.2.0": "1.2.0",
    "1.3.0": "1.3.0",
    "2.0.0": "2.0.0",
};

/**
 * Tries to fetch and parse a wms capabilities document
 * @param {string} url
 * @returns {Promise<void>}
 */
export async function fetchAndParseWmsCapabilities(url) {
    const response = await axios.get(url);

    // In case it is valid request we try to parse the capabilities document
    if (response.status === 200) {
        const capabilities = new WMSCapabilities().parse(response.data);
        const parsedLayers = parseLayersFromCapabilities(capabilities);

        if (parsedLayers.length === 0) {
            throw new Error(
                "There must be at least one layer present supporting the EPSG:3857 CRS."
            );
        }

        return parsedLayers;
    } else {
        throw new Error(`Could not fetch wms capabilities document at ${url}`);
    }
}

/**
 * Parsing function for the wms capabilities
 *
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
const parseLayersFromCapabilities = (capabilities) => {
    const layers = [];
    const version = capabilities.version;

    if (version === WMS_VERSION["1.0.0"]) {
        // wms-capabilities does not parse the Request element according to the specification
        // impossible to extract the GetMap request url from the capabilities
        throw new Error("WMS version 1.0.0 is not supported");
    }

    const layerUrl = extractRequestUrl(capabilities);
    const tileSize = 512;

    const traverseLayer = (layer) => {
        if (!isDefined(layer)) {
            return;
        }

        // layers with the Name attribute can be requested in GetMap
        if (isDefined(layer.Name) && hasValidCRS(layer)) {
            const l = {
                id: layer.Name,
                label: layer.Title,
                type: "wms",
                layers: layer.Name,
                tileSize: tileSize,
                urls: [layerUrl],
                version,
            };
            layers.push(l);
        }

        if (isDefined(layer.Layer) && Array.isArray(layer.Layer)) {
            layer.Layer.forEach((childLayer) => traverseLayer(childLayer));
        }
    };

    if (isDefined(capabilities?.Capability?.Layer)) {
        traverseLayer(capabilities.Capability.Layer);
    }

    return layers;
};

const extractRequestUrl = (capabilities) => {
    try {
        const extractedUrl =
            capabilities.Capability.Request.GetMap.DCPType[0].HTTP.Get
                .OnlineResource;

        return extractedUrl;
    } catch (error) {
        throw new Error(
            "Invalid GetCapabilities response. The URL for the GetMap request is not defined"
        );
    }
};

const hasValidCRS = (layer) => {
    const expectedCrs = "EPSG:3857";

    // from wms version 1.2.0 onwards
    if (isDefined(layer.CRS)) {
        return layer.CRS.includes(expectedCrs);
    }

    // up to WMS version 1.1.1
    if (isDefined(layer.SRS)) {
        let crsList = [];

        // see specification OGC 01-068r3 section 7.1.4.5.5
        // whitespace-separated list within a single element
        if (layer.SRS.length === 1) {
            crsList = layer.SRS[0].split(" ");
        } else {
            crsList = layer.SRS;
        }

        return crsList.includes(expectedCrs);
    }

    return false;
};

export const buildWmsGetMapUrl = (layerDefinition) => {
    const baseUrl = layerDefinition.urls[0];

    const defaultWmsVersion = "1.3.0";
    const defaultTileSize = 512;

    const version = layerDefinition.version ?? defaultWmsVersion;

    const params = {
        format: "image/png",
        service: "WMS",
        version,
        request: "GetMap",
        ...getCrs(version, "EPSG:3857"),
        transparent: true,
        width: layerDefinition.tileSize ?? defaultTileSize,
        height: layerDefinition.tileSize ?? defaultTileSize,
        layers: layerDefinition.layers,
        STYLES: "",
    };

    const searchParams = new URLSearchParams(params);
    const parsedUrl = new URL(baseUrl);

    const sanitizedUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;

    // do not url-encode the bbox token
    const url = `${sanitizedUrl}?bbox={bbox-epsg-3857}&${searchParams.toString()}`;

    return url;
};

const getCrs = (version, crs) => {
    const versionsUsingSrs = [
        WMS_VERSION["1.0.0"],
        WMS_VERSION["1.1.0"],
        WMS_VERSION["1.1.1"],
    ];

    if (versionsUsingSrs.includes(version)) {
        return { SRS: crs };
    }

    return { CRS: crs };
};

export const addWMSLayer = (map, baseMap, baseMapStyleLayers) => {
    if (!baseMap) return false;

    // First, hide vector base map layers
    hideVectorBaseMapLayer(map, baseMapStyleLayers);

    const url = buildWmsGetMapUrl(baseMap);

    // Add the WMS source if it does not already exist
    if (!map.getSource(WMS_SOURCE_ID)) {
        // Add the WMS source
        const wmsSource = {
            type: "raster",
            tiles: [url],
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
