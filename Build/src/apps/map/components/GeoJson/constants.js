/**
 * Created by nicolas.looschen@pikobytes.de on 05.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import {
    DEFAULT_STYLE_VALUES,
    GEOJSON_LAYER_TYPES,
} from "../CustomLayers/GeoJsonLayer/VkfMapInteractionStrategy/constants.js";

export const FEATURE_PROPERTIES = {
    imgLink: "img_link",
    title: "title",
    description: "description",
    time: "time",
    marker: "marker",
    fill: "fill",
    fillOpacity: "fill-opacity",
    stroke: "stroke",
    strokeWidth: "stroke-width",
    strokeOpacity: "stroke-opacity",
};

export const emptyFeatureCollection = {
    type: "FeatureCollection",
    features: [],
};

export const defaultStylesForGeometry = {
    Point: {
        marker: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.SYMBOL].COLOR,
    },
    MultiPoint: {
        marker: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.SYMBOL].COLOR,
    },
    Polygon: {
        fill: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].COLOR,
        "fill-opacity": DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].OPACITY,
        stroke: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].COLOR,
        "stroke-opacity":
            DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].OPACITY,
        "stroke-width": DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].WIDTH,
    },
    MultiPolygon: {
        fill: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].COLOR,
        "fill-opacity": DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].OPACITY,
        stroke: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].COLOR,
        "stroke-opacity":
            DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].OPACITY,
        "stroke-width": DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.OUTLINE].WIDTH,
    },
    LineString: {
        stroke: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].COLOR,
        "stroke-opacity":
            DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].OPACITY,
        "stroke-width": DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].WIDTH,
    },
    MultiLineString: {
        stroke: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].COLOR,
        "stroke-opacity":
            DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].OPACITY,
        "stroke-width": DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].WIDTH,
    },
    // carried over from legacy code, not supported
    GeometryCollection: {
        fill: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].COLOR,
        "fill-opacity": DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].OPACITY,
        stroke: DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].COLOR,
        "stroke-opacity":
            DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].OPACITY,
        "stroke-width": DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.LINE].WIDTH,
    },
};

// Configures styling fields of the geojson edit dialog.
export const styleFieldSettings = {
    marker: {
        type: "color",
    },
    fill: {
        type: "color",
    },
    "fill-opacity": {
        step: 0.05,
        min: 0,
        max: 1,
        type: "number",
    },
    stroke: {
        type: "color",
    },
    "stroke-opacity": {
        max: 1,
        min: 0,
        step: 0.05,
        type: "number",
    },
    "stroke-width": { step: 0.1, min: 0, max: 20, type: "number" },
};

export const stylingProperties = Object.keys(styleFieldSettings);
export const predefinedProperties = [
    FEATURE_PROPERTIES.time,
    FEATURE_PROPERTIES.title,
    FEATURE_PROPERTIES.imgLink,
    FEATURE_PROPERTIES.description,
];

export const GEOMETRY_TYPE = {
    POINT: "Point",
    MULTI_POINT: "MultiPoint",
    POLYGON: "Polygon",
    MULTI_POLYGON: "MultiPolygon",
    LINE_STRING: "LineString",
    MULTI_LINE_STRING: "MultiLineString",
    GEOMETRY_COLLECTION: "GeometryCollection",
};

export const VECTOR_MAP_TYPES = {
    LOCAL: "local",
    REMOTE: "remote",
};
