/*
 * Created by tom.schulze@pikobytes.de on 06.11.26.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import bbox from "@turf/bbox";
import { isDefined } from "@util/util";
import { LngLat } from "maplibre-gl";

/**
 * Calculate map scale at a given zoom level and latitude
 * @param {number} zoom - MapLibre zoom level
 * @param {number} latitude - Latitude in degrees
 * @param {number} dpi - Screen DPI (default 96 for web, can use window.devicePixelRatio * 96)
 * @returns {number} Map scale denominator (e.g., 50000 for 1:50,000)
 */
export const getMapScale = (zoom, latitude, dpi = 96) => {
    // Earth's equatorial circumference in meters
    const earthCircumference = 40075016.686;

    // Tile size in pixels (MapLibre default is 512)
    const tileSize = 512;

    // Meters per pixel at zoom level 0 at the equator
    const metersPerPixelAtZoom0 = earthCircumference / tileSize;

    // Meters per pixel at the given zoom level at the equator
    const metersPerPixel = metersPerPixelAtZoom0 / Math.pow(2, zoom);

    // Adjust for latitude (Web Mercator distortion)
    const metersPerPixelAtLat =
        metersPerPixel * Math.cos((latitude * Math.PI) / 180);

    // Convert to meters per inch on screen
    const metersPerInch = metersPerPixelAtLat * dpi;

    // Scale denominator (1:X)
    const scale = metersPerInch * 39.3701; // 39.3701 inches per meter

    return scale;
};

export const calculateOptimalResolutionForViewport = (map) => {
    const zoom = map.getZoom();
    const center = map.getCenter();
    const latitude = center.lat;

    const scale = getMapScale(zoom, latitude);

    // Tobler's Pixel Size Rule
    const optimalResolution = scale / 2000

    return optimalResolution;
};

/**
 * Returns only the polygon features of the search area
 * @param {Array.<import("geojson").Feature>} searchArea
 * @returns {Array.<import("geojson").Feature<import("geojson").Polygon>>}
 */
export const getPolygonFeatures = (searchArea) =>
    searchArea.filter(
        (ft) => ft?.geometry?.type === "Polygon"
    );

export const calculateMaxDistance = (searchArea, center) => {
    if (!isDefined(searchArea)) {
        return 0;
    }

    const searchPolygonsFeatures = getPolygonFeatures(searchArea);

    const [minX, minY] = bbox({
        type: "FeatureCollection",
        features: searchPolygonsFeatures,
    });
    const cornerPoint = new LngLat(minX, minY);
    const maxDistance = cornerPoint.distanceTo(center);

    return maxDistance;
};
