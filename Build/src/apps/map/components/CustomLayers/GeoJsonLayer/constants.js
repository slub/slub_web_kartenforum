/*
 * Created by tom.schulze@pikobytes.de on 11.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import SettingsProvider from "@settings-provider";

export const GEOJSON_LAYER_TYPES = {
    SYMBOL: "symbol",
    LINE: "line",
    FILL: "fill",
    OUTLINE: "outline",
};

export const MAPLIBRE_OPACITY_KEYS = {
    [GEOJSON_LAYER_TYPES.LINE]: "line-opacity",
    [GEOJSON_LAYER_TYPES.FILL]: "fill-opacity",
    [GEOJSON_LAYER_TYPES.OUTLINE]: "outline-opacity",
};

export const GEOJSON_OPACITY_KEYS = {
    [GEOJSON_LAYER_TYPES.LINE]: "stroke-opacity",
    [GEOJSON_LAYER_TYPES.FILL]: "fill-opacity",
    [GEOJSON_LAYER_TYPES.OUTLINE]: "stroke-opacity",
};

export const layerHasOpacityProperty = (type) => {
    return Object.keys(GEOJSON_OPACITY_KEYS).includes(type);
};

export const DEFAULT_STYLE_VALUES = {
    [GEOJSON_LAYER_TYPES.SYMBOL]: {
        COLOR: "#0000FF",
    },
    [GEOJSON_LAYER_TYPES.LINE]: {
        COLOR: "#00FF00",
        WIDTH: 3,
        OPACITY: 1,
    },
    [GEOJSON_LAYER_TYPES.OUTLINE]: {
        COLOR: "#0000FF",
        WIDTH: 1,
        OPACITY: 1,
    },
    [GEOJSON_LAYER_TYPES.FILL]: {
        COLOR: "#FFFF00",
        OPACITY: 0.27,
    },
};

export const LAYER_DEFINITIONS = {
    [GEOJSON_LAYER_TYPES.SYMBOL]: {
        type: "symbol",
        layout: {
            "icon-image": SettingsProvider.getSettings()["MARKER_IMAGE_ID"],
            "icon-size": 0.5,
            "icon-anchor": "bottom",
        },
        paint: {
            "icon-color": [
                "to-color",
                ["feature-state", "marker"],
                ["get", "marker"],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.SYMBOL].COLOR,
            ],
            "icon-halo-color": "#FFF",
            "icon-halo-width": 1,
        },
        filter: ["in", "$type", "Point"],
    },
    [GEOJSON_LAYER_TYPES.LINE]: {
        type: "line",
        paint: {
            "line-color": [
                "coalesce",
                ["feature-state", "stroke"],
                ["get", "stroke"],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].COLOR,
            ],
            "line-width": [
                "coalesce",
                ["feature-state", "stroke-width"],
                ["get", "stroke-width"],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].WIDTH,
            ],
            "line-opacity": [
                "coalesce",
                ["feature-state", "stroke-opacity"],
                ["get", "stroke-opacity"],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].OPACITY,
            ],
        },
        filter: ["in", "$type", "LineString"],
    },
    [GEOJSON_LAYER_TYPES.OUTLINE]: {
        type: "line",
        paint: {
            "line-color": [
                "coalesce",
                ["feature-state", "stroke"],
                ["get", "stroke"],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].COLOR,
            ],
            "line-width": [
                "coalesce",
                ["feature-state", "stroke-width"],
                ["get", "stroke-width"],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].WIDTH,
            ],
            "line-opacity": [
                "coalesce",
                ["feature-state", "stroke-opacity"],
                ["get", "stroke-opacity"],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].OPACITY,
            ],
        },
        filter: ["in", "$type", "Polygon"],
    },
    [GEOJSON_LAYER_TYPES.FILL]: {
        type: "fill",
        paint: {
            "fill-color": [
                "coalesce",
                ["feature-state", "fill"],
                ["get", "fill"],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].COLOR,
            ],
            "fill-opacity": [
                "coalesce",
                ["feature-state", "fill-opacity"],
                ["get", "fill-opacity"],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].OPACITY,
            ],
        },
        filter: ["in", "$type", "Polygon"],
    },
};
