/**
 * Created by nicolas.looschen@pikobytes.de on 03.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { Circle as CircleStyle, Icon, Fill, Stroke, Style } from "ol/style";

import {
    getMarkerUrl,
    MARKERS,
} from "./components/DialogEditFeature/DialogEditFeatureRow/components/MarkerPicker";

export const defaultIconSettings = {
    anchor: [0.5, 1],
    anchorXUnits: "fraction",
    anchorYUnits: "fraction",
    src: getMarkerUrl(MARKERS[0]),
    scale: 0.5,
};

const image = new Icon(defaultIconSettings);

export const defaultStyles = {
    Point: new Style({
        image,
    }),
    LineString: new Style({
        stroke: new Stroke({
            color: "#00FF00FF",
            width: 1,
        }),
    }),
    MultiLineString: new Style({
        stroke: new Stroke({
            color: "#00FF00FF",
            width: 1,
        }),
    }),
    MultiPoint: new Style({
        image,
    }),
    MultiPolygon: new Style({
        stroke: new Stroke({
            color: "#0000FFFF",
            width: 1,
        }),
        fill: new Fill({
            color: "#FFFF0044",
        }),
    }),
    Polygon: new Style({
        stroke: new Stroke({
            color: "#0000FFFF",
            width: 3,
        }),
        fill: new Fill({
            color: "#0000FF20",
        }),
    }),
    GeometryCollection: new Style({
        stroke: new Stroke({
            color: "#0000FFFF",
            width: 2,
        }),
        fill: new Fill({
            color: "#0000FFFF",
        }),
        image: new CircleStyle({
            radius: 10,
            fill: new Fill({
                color: "#0000FF20",
            }),
            stroke: new Stroke({
                color: "#0000FFFF",
            }),
        }),
    }),
    Circle: new Style({
        stroke: new Stroke({
            color: "#FF0000FF",
            width: 2,
        }),
        fill: new Fill({
            color: "#FF000066",
        }),
    }),
};

export const defaultStyleFunction = function (feature) {
    return defaultStyles[feature.getGeometry().getType()];
};
