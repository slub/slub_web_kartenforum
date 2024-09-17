/*
 * Created by tom.schulze@pikobytes.de on 11.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */
export const METADATA = {
    id: "id",
    timePublished: "time_published",
    timeChanged: "time_changed",
    title: "title",
    thumbnailUrl: "thumb_url",
    bounds: "bounds",
    type: "type",
    hasGeoReference: "has_georeference",
    tmsUrls: "tms_urls",
    onlineResources: "online_resources",
    mapScale: "map_scale",
};

export const GEOJSON_LAYER_TYPES = {
    SYMBOL: "symbol",
    LINE: "line",
    FILL: "fill",
    OUTLINE: "outline",
};

export const MAP_LIBRE_METADATA = {
    id: "vkf:layer_id",
};

export const MAPLIBRE_OPACITY_KEYS = {
    [GEOJSON_LAYER_TYPES.SYMBOL]: "icon-opacity",
    [GEOJSON_LAYER_TYPES.LINE]: "line-opacity",
    [GEOJSON_LAYER_TYPES.FILL]: "fill-opacity",
    [GEOJSON_LAYER_TYPES.OUTLINE]: "outline-opacity",
};

// TODO remove icon-opacity and adapt dynamic filter expressions in setOpacity method in GeoJSONLayer
export const GEOJSON_OPACITY_KEYS = {
    [GEOJSON_LAYER_TYPES.SYMBOL]: "icon-opacity",
    [GEOJSON_LAYER_TYPES.LINE]: "stroke-opacity",
    [GEOJSON_LAYER_TYPES.FILL]: "fill-opacity",
    [GEOJSON_LAYER_TYPES.OUTLINE]: "stroke-opacity",
};