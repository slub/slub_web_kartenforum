/**
 * Created by nicolas.looschen@pikobytes.de on 05.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import {
    DEFAULT_STYLE_VALUES,
    GEOJSON_LAYER_TYPES,
} from "../CustomLayers/GeoJsonLayer/constants.js";

export const emptyFeatureCollection = {
    type: "FeatureCollection",
    features: [],
};

const isLine = (geometry) =>
    ["MultiLineString", "LineString"].includes(geometry);
const isPolygon = (geometry) => ["MultiPolygon", "Polygon"].includes(geometry);

const getType = (geometry) => {
    if (isLine(geometry)) {
        return GEOJSON_LAYER_TYPES.LINE;
    }

    if (isPolygon(geometry)) {
        return GEOJSON_LAYER_TYPES.OUTLINE;
    }

    return GEOJSON_LAYER_TYPES.LINE;
};

const DEFAULT_STYLE_FIELD_VALUES = {
    marker: () => DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.SYMBOL].COLOR,
    fill: () => DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].COLOR,
    "fill-opacity": () =>
        DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.FILL].OPACITY,
    stroke: (geometry) => {
        const layerType = getType(geometry);
        return DEFAULT_STYLE_VALUES[layerType].COLOR;
    },
    "stroke-opacity": (geometry) => {
        const layerType = getType(geometry);
        return DEFAULT_STYLE_VALUES[layerType].OPACITY;
    },
    "stroke-width": (geometry) => {
        const layerType = getType(geometry);
        return DEFAULT_STYLE_VALUES[layerType].WIDTH;
    },
};

/**
 * Configure styling fields of the geojson edit dialog.
 * Keep in sync with FEATURE_PROPERTIES.
 */
export const styleFieldSettings = {
    marker: {
        default: DEFAULT_STYLE_FIELD_VALUES["marker"],
        geometryTypes: ["Point", "MultiPoint"],
        inputProps: { type: "color" },
    },
    fill: {
        default: DEFAULT_STYLE_FIELD_VALUES["fill"],
        geometryTypes: ["MultiPolygon", "Polygon", "GeometryCollection"],
        inputProps: { type: "color" },
    },
    "fill-opacity": {
        default: DEFAULT_STYLE_FIELD_VALUES["fill-opacity"],
        geometryTypes: ["MultiPolygon", "Polygon", "GeometryCollection"],
        inputProps: { step: 0.05, min: 0, max: 1, type: "number" },
    },
    stroke: {
        default: DEFAULT_STYLE_FIELD_VALUES["stroke"],
        geometryTypes: [
            "MultiPolygon",
            "Polygon",
            "GeometryCollection",
            "LineString",
            "MultiLineString",
        ],
        inputProps: { type: "color" },
    },
    "stroke-opacity": {
        default: DEFAULT_STYLE_FIELD_VALUES["stroke-opacity"],
        geometryTypes: [
            "MultiPolygon",
            "Polygon",
            "GeometryCollection",
            "LineString",
            "MultiLineString",
        ],
        inputProps: { max: 1, min: 0, step: 0.05, type: "number" },
    },
    "stroke-width": {
        default: DEFAULT_STYLE_FIELD_VALUES["stroke-width"],
        geometryTypes: [
            "MultiPolygon",
            "Polygon",
            "GeometryCollection",
            "LineString",
            "MultiLineString",
        ],
        inputProps: { step: 0.1, min: 0, max: 20, type: "number" },
    },
};

// keep in sync with FEATURE_PROPERTIES
export const predefinedFieldSettings = {
    img_link: { inputProps: { type: "text" } },
    title: { inputProps: { type: "text" } },
    description: { inputProps: { type: "text" } },
    time: { inputProps: { type: "text" } },
};

/*
 * Properties which will be present on the feature, but should not be shown in the edit dialog
 */
export const ignoredProperties = ["geometry"];

/**
 * Properties used for the styling of features
 * @type {string[]}
 */
export const stylingProperties = Object.keys(styleFieldSettings);

export const predefinedProperties = Object.keys(predefinedFieldSettings);

export const GEOMETRY_TYPE = {
    POINT: "Point",
    MULTI_POINT: "MultiPoint",
    POLYGON: "Polygon",
    MULTI_POLYGON: "MultiPolygon",
    LINE_STRING: "LineString",
    MULTI_LINE_STRING: "MultiLineString",
    GEOMETRY_COLLECTION: "GeometryCollection",
};

// keep in sync with predefinedFieldSettings and styleFieldSettings
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

export const VECTOR_MAP_TYPES = {
    LOCAL: "local",
    REMOTE: "remote",
};
