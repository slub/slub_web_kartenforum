/**
 * Created by jacob.mendt@pikobytes.de on 17.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import Circle from "ol/src/style/Circle";
import Fill from "ol/src/style/Fill";
import Stroke from "ol/src/style/Stroke";
import Style from "ol/src/style/Style";
import Text from "ol/src/style/Text";

/**
 * Creates a style object for a ol.Feature with a point geometry.
 * @param {string} text
 * @param {number|undefined} radius
 * @returns {ol.style.Style}
 */
export function createGcpDefaultStyle(text, radius = 8) {
    const dash = (2 * Math.PI * radius) / 6;
    return new Style({
        image: new Circle({
            radius: radius,
            fill: new Fill({
                color: "rgba(255,255,255,0.6)",
            }),
            stroke: new Stroke({
                color: "rgba(49,159,211,0.5)",
                width: 15,
                lineDash: [0, dash, dash, dash, dash, dash, dash],
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
}
