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
import { MAP_LIBRE_METADATA } from "../MapWrapper/geojson/constants.js";

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

  setPaintProperty(layerId, name, value, options) {
    const result = super.setPaintProperty(layerId, name, value, options);
    const layer = this.getLayer(layerId);

    const applicationLayerId = layer?.metadata?.[MAP_LIBRE_METADATA.id];

    if (OPACITY_PROPERTIES.has(name) && applicationLayerId) {
      this.fire(customEvents.opacityChanged, {
        layerId: applicationLayerId,
        property: name,
        value,
      });
    }

    return result;
  }

  setLayoutProperty(layerId, name, value, options) {
    const result = super.setLayoutProperty(layerId, name, value, options);
    const layer = this.getLayer(layerId);

    const applicationLayerId = layer?.metadata?.[MAP_LIBRE_METADATA.id];

    if (LAYOUT_PROPERTIES.has(name) && applicationLayerId) {
      this.fire(customEvents.visibilityChanged, {
        layerId: applicationLayerId,
        property: name,
        value,
      });
    }

    return result;
  }
}

export default VkfMap;
