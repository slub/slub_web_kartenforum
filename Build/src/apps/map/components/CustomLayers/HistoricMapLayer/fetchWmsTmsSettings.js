/*
 * Created by tom.schulze@pikobytes.de on 18.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */
import axios from "axios";
import { fetchAndParseWmsCapabilities } from "@map/components/BasemapSelectorControl/util.js";
import { METADATA } from "../constants";

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

        const boundsElement = xmlDoc.getElementsByTagName("BoundingBox")[0];
        const bounds = [
            boundsElement.getAttribute("minx"),
            boundsElement.getAttribute("miny"),
            boundsElement.getAttribute("maxx"),
            boundsElement.getAttribute("maxy"),
        ].map(parseFloat);

        const tileSets = xmlDoc.getElementsByTagName("TileSet");

        const tileSize =
            parseInt(
                xmlDoc
                    .getElementsByTagName("TileFormat")[0]
                    .getAttribute("width")
            ) ?? 256;

        return { bounds, maxZoom: tileSets.length - 1, tileSize };
    } catch (error) {
        console.error("Error fetching or parsing XML:", error);
        return null;
    }
};

export const fetchWmsTmsSettings = async (layer) => {
    const tms_urls = layer.getMetadata(METADATA.tmsUrls);
    const wms_capability_url = layer
        .getMetadata(METADATA.onlineResources)
        .find((resource) => resource.type === "WMS").url;

    const isTmsDefined = Array.isArray(tms_urls) && tms_urls.length > 0;

    let sourceSettings;
    if (isTmsDefined) {
        // The zoom level starts with 0 till maxZoom - 1
        const { maxZoom, bounds, tileSize } =
            await fetchMaxZoomFromTileMapSource(tms_urls[0]);
        sourceSettings = {
            bounds,
            tileSize,
            maxzoom: maxZoom,
            tiles: tms_urls.map((url) => `${url}/{z}/{x}/{y}.png`),
            scheme: "tms",
        };
    } else {
        const layers = await fetchAndParseWmsCapabilities(wms_capability_url);

        sourceSettings = {
            tiles: layers[0].urls,
        };
    }

    return sourceSettings;
};
