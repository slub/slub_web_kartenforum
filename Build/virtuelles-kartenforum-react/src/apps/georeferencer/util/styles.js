/**
 * Created by jacob.mendt@pikobytes.de on 17.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

vk2.utils.Styles.GEOREFERENCE_POINT_HOVER = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            color: "rgba(255,0,0,0.1)",
        }),
        stroke: new ol.style.Stroke({
            color: "#f00",
            width: 1,
        }),
    }),
    zIndex: 100000,
});
