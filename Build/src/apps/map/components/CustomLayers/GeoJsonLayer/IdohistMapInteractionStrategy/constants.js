/*
 * Created by tom.schulze@pikobytes.de on 16.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

export const IDOHIST_FEATURE_PROPS = {
    hoverPolygon: "hover_polygon",
    contentValue: "content_value",
    temporalValue: "temporal_value",
    spatialValue: "spatial_value",
};

export const defaultFilters = [
    "all",
    ["==", ["geometry-type"], "Polygon"],
    ["==", ["id"], "NON_EXISTING_ID"],
];

const IDOHIST_COLOR = "#AC40FF";

export const DEFAULT_OPACITY_VALUES = {
    fill: 0.4,
    line: 1,
};

// maplibre style specifications to display hover polygons
export const IDOHIST_LAYER_DEFINITIONS = {
    fill: {
        type: "fill",
        paint: {
            "fill-color": IDOHIST_COLOR,
            "fill-opacity": DEFAULT_OPACITY_VALUES.fill,
        },
        filter: defaultFilters,
    },
    line: {
        type: "line",
        paint: {
            "line-color": IDOHIST_COLOR,
            "line-width": 2,
            "line-opacity": DEFAULT_OPACITY_VALUES.line,
        },
        filter: defaultFilters,
    },
};
