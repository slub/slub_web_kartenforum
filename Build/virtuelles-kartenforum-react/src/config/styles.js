/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Fill, Stroke, Circle, Style } from "ol/style";

/**
 * @type {Object}
 */
export const MAP_SEARCH_FEATURE = new Style({
    stroke: new Stroke({
        color: "rgba(0, 0, 255, 1.0)",
        width: 2,
    }),
});

/**
 * @type {Object}
 */
export const MAP_SEARCH_HOVER_FEATURE = new Style({
    stroke: new Stroke({
        color: "#f00",
        width: 1,
    }),
    fill: new Fill({
        color: "rgba(255,0,0,0.2)",
    }),
});

/**
 * @type {Object}
 */
export const MESSTISCHBLATT_BORDER_STYLE = new Style({
    stroke: new Stroke({
        color: "#000000",
        width: 2,
    }),
});

/**
 * @type {Object}
 */
export const GEOREFERENCE_CLIP_POLYGON = new Style({
    fill: new Fill({
        color: "rgba(255, 255, 255, 0.2)",
    }),
    stroke: new Stroke({
        color: "#ffcc33",
        width: 2,
    }),
    image: new Circle({
        radius: 7,
        fill: new Fill({
            color: "#ffcc33",
        }),
    }),
});

/**
 * @param {string=} opt_text
 * @return {Style}
 */
export const getGeoreferencePointStyle = function (opt_text) {
    var radius = 8,
        dash = (2 * Math.PI * radius) / 6,
        dash = [0, dash, dash, dash, dash, dash, dash],
        text = goog.isDef(opt_text) ? opt_text : undefined;
    return new Style({
        image: new Circle({
            radius: radius,
            fill: new Fill({
                color: "rgba(255,255,255,0.6)",
            }),
            stroke: new Stroke({
                color: "rgba(49,159,211,0.5)",
                width: 15,
                lineDash: dash,
            }),
        }),
        text: new Text({
            textAlign: "start",
            textBaseline: "bottom",
            font: "12px Calibri,sans-serif",
            text: text,
            fill: new Fill({ color: "#aa3300" }),
            stroke: new Stroke({ color: "#ffffff", width: 3 }),
            offsetX: 10,
            offsetY: -5,
        }),
    });
};

/**
 * @type {Object}
 */
export const GEOREFERENCE_POINT_PENDING = new Style({
    image: new Circle({
        radius: 7,
        fill: new Fill({
            color: "rgba(255, 255, 255, 0.6)",
        }),
        stroke: new Stroke({
            color: "#29A329",
            width: 1.5,
        }),
    }),
});

/**
 * @type {Object}
 */
export const GEOREFERENCE_POINT_HOVER = new Style({
    image: new Circle({
        radius: 7,
        fill: new Fill({
            color: "rgba(255,0,0,0.1)",
        }),
        stroke: new Stroke({
            color: "#f00",
            width: 1,
        }),
    }),
    zIndex: 100000,
});

/**
 * @param {string=} opt_text
 * @return {Style}
 */
export const getGeoreferencePointHover = function (opt_text) {
    var radius = 11,
        dash = (2 * Math.PI * radius) / 6,
        text = goog.isDef(opt_text) ? opt_text : undefined;
    dash = [0, dash, dash, dash, dash, dash, dash];
    return new Style({
        image: new Circle({
            radius: radius,
            fill: new Fill({
                color: "rgba(255,128,0,0.6)",
            }),
            stroke: new Stroke({
                color: "rgba(240,0,0,0.5)",
                width: 15,
                lineDash: dash,
            }),
        }),
        text: new Text({
            textAlign: "start",
            textBaseline: "bottom",
            font: "12px Calibri,sans-serif",
            text: text,
            fill: new Fill({ color: "#aa3300" }),
            stroke: new Stroke({ color: "#ffffff", width: 3 }),
            offsetX: 10,
            offsetY: -5,
        }),
    });
};
