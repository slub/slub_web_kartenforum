/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
export const TERRAIN_SOURCE_ID = "vkf-terrain";
export const TERRAIN_HILLSHADE_SOURCE_ID = "vkf-hillshade";

export const OPACITY_PROPERTIES = new Set([
    "fill-opacity",
    "line-opacity",
    "circle-opacity",
    "icon-opacity",
    "text-opacity",
    "raster-opacity",
]);

export const LAYOUT_PROPERTIES = new Set(["visibility"]);

export const ActiveDialog = {
    None: "NONE",
    BasemapSelector: "BASEMAP_SELECTOR",
    Permalink: "PERMALINK",
};
