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
const defaultLocale = {
  "AttributionControl.ToggleAttribution": "Toggle attribution",
  "AttributionControl.MapFeedback": "Map feedback",
  "FullscreenControl.Enter": "Enter fullscreen",
  "FullscreenControl.Exit": "Exit fullscreen",
  "GeolocateControl.FindMyLocation": "Find my location",
  "GeolocateControl.LocationNotAvailable": "Location not available",
  "LogoControl.Title": "MapLibre logo",
  "Map.Title": "Map",
  "Marker.Title": "Map marker",
  "NavigationControl.ResetBearing": "Reset bearing to north",
  "NavigationControl.ZoomIn": "Zoom in",
  "NavigationControl.ZoomOut": "Zoom out",
  "Popup.Close": "Close popup",
  "ScaleControl.Feet": "ft",
  "ScaleControl.Meters": "m",
  "ScaleControl.Kilometers": "km",
  "ScaleControl.Miles": "mi",
  "ScaleControl.NauticalMiles": "nm",
  "TerrainControl.Enable": "Enable terrain",
  "TerrainControl.Disable": "Disable terrain",
  "CooperativeGesturesHandler.WindowsHelpText":
    "Use Ctrl + scroll to zoom the map",
  "CooperativeGesturesHandler.MacHelpText": "Use ⌘ + scroll to zoom the map",
  "CooperativeGesturesHandler.MobileHelpText":
    "Use two fingers to move the map",
};
// Extend the maplibre map object with some custom events
export class VkfMap extends MapWithTerrainBehavior {
  _locale = defaultLocale;

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
