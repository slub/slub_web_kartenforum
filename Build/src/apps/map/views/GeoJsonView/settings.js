/**
 * Created by nicolas.looschen@pikobytes.de on 05.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { Icon, Style } from "ol/style";

import {
    generateFillChangeHandler,
    generateStrokeChangeHandler,
    splitAlphaChannel,
    updateAlphaChannel,
    updateColorChannels,
} from "../../components/GeoJsonEditPopUp/util/styleUtils.js";
import { getDefaultIconSettings } from "../../components/MapWrapper/getDefaultStyles.js";
import {
    getMarkerIdFromUrl,
    getMarkerUrl,
} from "../../components/GeoJsonEditPopUp/components/MarkerPicker/MarkerPicker.jsx";

/**
 * Configure styling fields of the geojson edit dialog
 */
export const styleFieldSettings = {
    marker: {
        changeHandler: (feature, newValue) => {
            const newStyle = new Style({
                image: new Icon(
                    Object.assign({}, getDefaultIconSettings(), {
                        src: getMarkerUrl(newValue),
                    })
                ),
            });
            feature.setStyle(newStyle);
        },
        geometryTypes: ["Point", "MultiPoint"],
        type: "marker",
        valueExtractor: (style) => {
            return getMarkerIdFromUrl(style.getImage().getSrc());
        },
    },
    fill: {
        changeHandler: generateFillChangeHandler(updateColorChannels),
        geometryTypes: [
            "MultiPolygon",
            "Polygon",
            "GeometryCollection",
            "Circle", // TODO GEOJSON PORT - remove circle geometry? seems to be an openlayers relict
        ],
        type: "color",
        valueExtractor: (style) =>
            splitAlphaChannel(style.getFill().getColor())[0],
    },
    "fill-opacity": {
        changeHandler: generateFillChangeHandler(updateAlphaChannel),
        geometryTypes: [
            "MultiPolygon",
            "Polygon",
            "GeometryCollection",
            "Circle",
        ],
        step: 0.05,
        min: 0,
        max: 1,
        type: "number",
        valueExtractor: (style) =>
            splitAlphaChannel(style.getFill().getColor())[1],
    },
    stroke: {
        changeHandler: generateStrokeChangeHandler(updateColorChannels),
        geometryTypes: [
            "MultiPolygon",
            "Polygon",
            "GeometryCollection",
            "Circle",
            "LineString",
            "MultiLineString",
        ],
        type: "color",
        valueExtractor: (style) =>
            splitAlphaChannel(style.getStroke().getColor())[0],
    },
    "stroke-opacity": {
        changeHandler: generateStrokeChangeHandler(updateAlphaChannel),
        geometryTypes: [
            "MultiPolygon",
            "Polygon",
            "GeometryCollection",
            "Circle",
            "LineString",
            "MultiLineString",
        ],
        max: 1,
        min: 0,
        step: 0.05,
        type: "number",
        valueExtractor: (style) =>
            splitAlphaChannel(style.getStroke().getColor())[1],
    },
    "stroke-width": {
        geometryTypes: [
            "MultiPolygon",
            "Polygon",
            "GeometryCollection",
            "Circle",
            "LineString",
            "MultiLineString",
        ],
        step: 0.1,
        min: 0,
        max: 20,
        type: "number",
        valueExtractor: (style) => style.getStroke().getWidth(),
    },
};

export const predefinedFieldSettings = {
    img_link: { type: "text" },
    title: { type: "text" },
    description: { type: "text" },
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
