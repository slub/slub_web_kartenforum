/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import CustomEvents from "../MapWrapper/customEvents.js";
import customEvents from "../MapWrapper/customEvents.js";
import { MapWithTerrainBehavior } from "./MapWithTerrainBehavior.jsx";
import { LAYOUT_PROPERTIES, OPACITY_PROPERTIES } from "./constants.js";

// Extend the maplibre map object with some custom events
export class VkfMap extends MapWithTerrainBehavior {
  addControl(control, position) {
    const result = super.addControl(control, position);

    this.fire(CustomEvents.controlAdded, { control });

    return result;
  }

  removeControl(control) {
    const result = super.removeControl(control);

    this.fire(CustomEvents.controlRemoved, { control });

    return result;
  }

  addLayer(layer, beforeId) {
    const result = super.addLayer(layer, beforeId);

    this.fire(CustomEvents.layerAdded, { layerId: layer.id });

    return result;
  }

  removeLayer(id) {
    const result = super.removeLayer(id);

    this.fire(CustomEvents.layerRemoved, { layerId: id });

    return result;
  }

  moveLayer(id, beforeId) {
    const result = super.moveLayer(id, beforeId);

    this.fire(CustomEvents.layerMoved, {
      layerId: id,
      beforeId: beforeId,
    });

    return result;
  }

  setPaintProperty(layerId, name, value, options) {
    const result = super.setPaintProperty(layerId, name, value, options);

    if (OPACITY_PROPERTIES.has(name)) {
      this.fire(customEvents.opacityChanged, {
        layerId,
        property: name,
        value,
      });
    }

    return result;
  }

  setLayoutProperty(layerId, name, value, options) {
    const result = super.setLayoutProperty(layerId, name, value, options);

    if (LAYOUT_PROPERTIES.has(name)) {
      this.fire(customEvents.visibilityChanged, {
        layerId,
        property: name,
        value,
      });
    }

    return result;
  }
}

export default VkfMap;
