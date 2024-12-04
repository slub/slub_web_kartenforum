/*
 * Created by tom.schulze@pikobytes.de on 04.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import SettingsProvider from "@settings-provider";
import {
    DEFAULT_STYLE_VALUES,
    GEOJSON_LAYER_TYPES,
} from "@map/components/CustomLayers/GeoJsonLayer/constants";

const PREFIX = "user_";

const secondary = "rgb(0, 177, 158)";
const highlightColor = secondary;

export const styles = [
    // polygon outlines need two layers. a hot one with dashed line array and a cold one w/o dashed
    // can't be combined into one layer with expression syntax; see https://github.com/maplibre/maplibre-gl-js/issues/1235
    {
        id: "polygon-outline-hot",
        type: "line",
        layout: {
            "line-cap": "round",
            "line-join": "round",
        },
        paint: {
            "line-color": [
                "coalesce",
                ["get", `${PREFIX}stroke`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].COLOR,
            ],
            "line-width": [
                "coalesce",
                ["get", `${PREFIX}stroke-width`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].WIDTH,
            ],
            "line-opacity": [
                "coalesce",
                ["get", `${PREFIX}stroke-opacity`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].OPACITY,
            ],
            "line-dasharray": [0.2, 2],
        },
        filter: [
            "all",
            ["==", ["get", "active"], "true"],
            [
                "any",
                ["==", ["geometry-type"], "Polygon"],
                [
                    "all",
                    ["==", ["get", "mode"], "draw_polygon"],
                    ["==", ["geometry-type"], "LineString"],
                ],
            ],
        ],
    },
    {
        id: "polygon-outline-cold",
        type: "line",
        paint: {
            "line-color": [
                "coalesce",
                ["get", `${PREFIX}stroke`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].COLOR,
            ],
            "line-width": [
                "coalesce",
                ["get", `${PREFIX}stroke-width`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].WIDTH,
            ],
            "line-opacity": [
                "coalesce",
                ["get", `${PREFIX}stroke-opacity`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].OPACITY,
            ],
        },
        filter: [
            "all",
            ["==", ["get", "active"], "false"],
            ["==", ["geometry-type"], "Polygon"],
        ],
    },
    {
        id: "polygon-fill",
        type: "fill",
        paint: {
            "fill-color": [
                "coalesce",
                ["get", `${PREFIX}fill`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].COLOR,
            ],
            "fill-opacity": [
                "coalesce",
                ["get", `${PREFIX}fill-opacity`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].OPACITY,
            ],
        },
        filter: ["all", ["==", ["geometry-type"], "Polygon"]],
    },
    {
        id: "line-hot",
        type: "line",
        layout: {
            "line-cap": "round",
            "line-join": "round",
        },
        paint: {
            "line-color": [
                "coalesce",
                ["get", `${PREFIX}stroke`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].COLOR,
            ],
            "line-width": [
                "coalesce",
                ["get", `${PREFIX}stroke-width`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].WIDTH,
            ],
            "line-opacity": [
                "coalesce",
                ["get", `${PREFIX}stroke-opacity`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].OPACITY,
            ],
            "line-dasharray": [0.2, 2],
        },
        filter: [
            "all",
            ["==", ["get", "active"], "true"],
            ["==", ["geometry-type"], "LineString"],
            ["!=", ["get", "mode"], "draw_polygon"],
        ],
    },
    {
        id: "line-cold",
        type: "line",
        paint: {
            "line-color": [
                "coalesce",
                ["get", `${PREFIX}stroke`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].COLOR,
            ],
            "line-width": [
                "coalesce",
                ["get", `${PREFIX}stroke-width`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].WIDTH,
            ],
            "line-opacity": [
                "coalesce",
                ["get", `${PREFIX}stroke-opacity`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].OPACITY,
            ],
        },
        filter: [
            "all",
            ["==", ["get", "active"], "false"],
            ["==", ["geometry-type"], "LineString"],
        ],
    },
    {
        id: "point",
        type: "symbol",
        layout: {
            "icon-image": SettingsProvider.getSettings()["MARKER_IMAGE_ID"],
            "icon-size": 0.5,
            "icon-anchor": "bottom",
            "icon-allow-overlap": true,
        },
        paint: {
            "icon-color": [
                "to-color",
                ["get", `${PREFIX}marker`],
                DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.SYMBOL].COLOR,
            ],
            "icon-halo-color": [
                "case",
                ["==", ["get", "active"], "true"],
                highlightColor,
                "#fff",
            ],
            "icon-halo-width": [
                "case",
                ["==", ["get", "active"], "true"],
                2,
                1,
            ],
        },
        filter: [
            "all",
            ["==", ["geometry-type"], "Point"],
            ["==", ["get", "meta"], "feature"],
        ],
    },
    // Vertex
    //   Visible when editing polygons and lines
    //   Similar behaviour to Points
    //   Active state defines size
    {
        id: "gl-draw-vertex-outer",
        type: "circle",
        filter: [
            "all",
            ["==", ["geometry-type"], "Point"],
            ["==", ["get", "meta"], "vertex"],
            ["!=", ["get", "mode"], "simple_select"],
        ],
        paint: {
            "circle-radius": ["case", ["==", ["get", "active"], "true"], 7, 5],
            "circle-color": "#fff",
        },
    },
    {
        id: "gl-draw-vertex-inner",
        type: "circle",
        filter: [
            "all",
            ["==", ["geometry-type"], "Point"],
            ["==", ["get", "meta"], "vertex"],
            ["!=", ["get", "mode"], "simple_select"],
        ],
        paint: {
            "circle-radius": ["case", ["==", ["get", "active"], "true"], 5, 3],
            "circle-color": highlightColor,
        },
    },
    // Midpoint
    //   Visible when editing polygons and lines
    //   Tapping or dragging them adds a new vertex to the feature
    {
        id: "gl-draw-midpoint",
        type: "circle",
        filter: ["all", ["==", ["get", "meta"], "midpoint"]],
        paint: {
            "circle-radius": 3,
            "circle-color": highlightColor,
        },
    },
];
