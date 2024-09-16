/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { fetchAndParseWmsCapabilities } from "../BasemapSelectorControl/util.js";
import axios from "axios";
import {
    MAP_LIBRE_METADATA,
    METADATA,
} from "../MapWrapper/geojson/constants.js";
import { MAP_OVERLAY_FILL_ID } from "../MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";

/**
 * Fetches the maximum zoom value from an XML file located at the specified URL.
 *
 * @param {string} url - The URL of the tilemapresource.
 * @return {Promise<number>} The maximum zoom value.
 */
const fetchMaxZoomFromTileMapSource = async (url) => {
    try {
        const response = await axios.get(`${url}/tilemapresource.xml`);
        const xmlDoc = new DOMParser().parseFromString(
            response.data,
            "text/xml"
        );
        const tileSets = xmlDoc.getElementsByTagName("TileSet");
        return tileSets.length;
    } catch (error) {
        console.error("Error fetching or parsing XML:", error);
        return null;
    }
};

export const addHistoricMapLayer = async (historicMapLayer, map) => {
    const applicationLayerId = historicMapLayer.getId();
    const tms_urls = historicMapLayer.getMetadata(METADATA.tmsUrls);
    const wms_capability_url = historicMapLayer
        .getMetadata(METADATA.onlineResources)
        .find((resource) => resource.type === "WMS").url;

    const isTmsDefined = Array.isArray(tms_urls) && tms_urls.length > 0;

    let sourceSettings;
    if (isTmsDefined) {
        // The zoom level starts with 0 till maxZoom - 1
        const maxZoom = (await fetchMaxZoomFromTileMapSource(tms_urls[0])) - 1;
        sourceSettings = {
            maxZoom,
            tiles: tms_urls.map((url) => `${url}/{z}/{x}/{y}.png`),
            scheme: "tms",
        };
    } else {
        const layers = await fetchAndParseWmsCapabilities(wms_capability_url);

        sourceSettings = {
            tiles: layers[0].urls,
        };
    }

    map.addSource(applicationLayerId, {
        type: "raster",
        ...sourceSettings,
        bounds: historicMapLayer.getMetadata(METADATA.bounds),
    });

    map.addLayer(
        {
            id: applicationLayerId,
            type: "raster",
            metadata: { [MAP_LIBRE_METADATA.id]: applicationLayerId },
            source: applicationLayerId,
            layout: {
                visibility: "visible",
            },
        },
        MAP_OVERLAY_FILL_ID
    );

    console.log(map.getLayer(MAP_OVERLAY_FILL_ID), map.getStyle().layers);
};
