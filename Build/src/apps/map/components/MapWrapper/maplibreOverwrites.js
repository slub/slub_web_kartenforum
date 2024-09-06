/**
 * Created by nicolas.looschen@pikobytes.de on 06.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import CustomEvents from "./customEvents.js";
import customEvents from "./customEvents.js";

export const overwriteMapLibreBehavior = (map) => {
    const originalAddLayer = map.addLayer;
    const originalRemoveLayer = map.removeLayer;
    const originalSetPaintProperty = map.setPaintProperty;
    const originalSetLayoutProperty = map.setLayoutProperty;
    const originalMoveLayer = map.moveLayer;

    map.addLayer = function (layer, before) {
        console.log("Add layer", layer, before);
        // Call the original method
        originalAddLayer.call(this, layer, before);

        // Emit a custom event or trigger some action
        this.fire(CustomEvents.layerAdded, { layerId: layer.id });
    };

    // Override the removeLayer method
    map.removeLayer = function (layerId) {
        // Call the original method
        originalRemoveLayer.call(this, layerId);

        // Emit a custom event or trigger some action
        this.fire(CustomEvents.layerRemoved, { layerId: layerId });
    };

    map.moveLayer = function (layerId, beforeId) {
        // Call the original method
        originalMoveLayer.call(this, layerId, beforeId);

        // Emit a custom event or trigger some action
        this.fire(CustomEvents.layerMoved, {
            layerId: layerId,
            beforeId: beforeId,
        });
    };

    // Override setPaintProperty to listen for opacity changes
    map.setPaintProperty = function (layerId, property, value) {
        // Call the original method
        originalSetPaintProperty.call(this, layerId, property, value);

        // Check if the property being changed is an opacity-related property
        const opacityProperties = [
            "fill-opacity",
            "line-opacity",
            "circle-opacity",
            "icon-opacity",
            "text-opacity",
            "raster-opacity",
        ];

        if (opacityProperties.includes(property)) {
            // Emit a custom event
            this.fire(customEvents.opacityChanged, {
                layerId: layerId,
                property: property,
                value: value,
            });
        }
    };

    // Override setLayoutProperty to listen for visibility changes
    map.setLayoutProperty = function (layerId, property, value) {
        // Call the original method
        originalSetLayoutProperty.call(this, layerId, property, value);

        // Check if the property being changed is a visibility-related property
        const visibilityProperties = ["visibility"];

        if (visibilityProperties.includes(property)) {
            // Emit a custom event
            this.fire(customEvents.visibilityChanged, {
                layerId: layerId,
                property: property,
                value: value,
            });
        }
    };
};
