/**
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";

import { mapState } from "../../../../atoms/atoms";
import { isDefined } from "../../../../../../util/util";
import customEvents from "../../../MapWrapper/customEvents.js";

export const MAP_OVERLAY_SOURCE_ID = "vkf-map-overlay-source";
export const MAP_OVERLAY_FILL_ID = "vkf-map-overlay-fill";
export const MAP_OVERLAY_OUTLINE_ID = "vkf-map-overlay-outline";

const addOverlayLayer = (map) => {
  map.addSource(MAP_OVERLAY_SOURCE_ID, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer({
    id: MAP_OVERLAY_FILL_ID,
    type: "fill",
    source: MAP_OVERLAY_SOURCE_ID,
    paint: {
      "fill-color": "#ff0000",
      "fill-opacity": 0.2,
    },
  });

  map.addLayer({
    id: MAP_OVERLAY_OUTLINE_ID,
    type: "line",
    source: MAP_OVERLAY_SOURCE_ID,
    paint: {
      "line-color": "#ff0000",
      "line-width": 1,
    },
  });
};

export const updateOverlayLayer = (map, data) => {
  const source = map.getSource(MAP_OVERLAY_SOURCE_ID);
  if (source) {
    source.setData(data);
  }
};

const removeOverlayLayer = (map) => {
  if (map.getLayer(MAP_OVERLAY_FILL_ID)) {
    map.removeLayer(MAP_OVERLAY_FILL_ID);
  }

  if (map.getLayer(MAP_OVERLAY_OUTLINE_ID)) {
    map.removeLayer(MAP_OVERLAY_OUTLINE_ID);
  }

  if (map.getSource(MAP_OVERLAY_SOURCE_ID)) {
    map.removeSource(MAP_OVERLAY_SOURCE_ID);
  }
};

export const MapSearchOverlayLayer = () => {
  // State
  const map = useRecoilValue(mapState);

  ////
  // Effect section
  ////

  useEffect(() => {
    if (isDefined(map)) {
      const handleLoad = () => {
        addOverlayLayer(map);
      };

      if (map._loaded) {
        addOverlayLayer(map);
      } else {
        map.once("load", handleLoad);
      }

      return () => {
        removeOverlayLayer(map);
        map.off("load", handleLoad);
      };
    }
  }, [map]);

  useEffect(() => {
    if (isDefined(map)) {
      // keep overlay layers on top
      // @TODO: Check if we can adjust adding/removing of layers to avoid this -> Always insert before overlay layer
      const handleMapLayerChange = ({ layerId }) => {
        if (
          layerId !== MAP_OVERLAY_FILL_ID &&
          layerId !== MAP_OVERLAY_OUTLINE_ID
        ) {
          if (
            map.getLayer(MAP_OVERLAY_FILL_ID) &&
            map.getLayer(MAP_OVERLAY_OUTLINE_ID)
          ) {
            const layers = map.getStyle().layers;
            const lastLayer = layers[layers.length - 1];
            if (lastLayer.id !== MAP_OVERLAY_OUTLINE_ID) {
              map.moveLayer(MAP_OVERLAY_FILL_ID, null);
              map.moveLayer(MAP_OVERLAY_OUTLINE_ID, null);
            }
          }
        }
      };

      map.on(customEvents.layerAdded, handleMapLayerChange);
      map.on(customEvents.layerRemoved, handleMapLayerChange);
      map.on(customEvents.layerMoved, handleMapLayerChange);

      return () => {
        map.off(customEvents.layerAdded, handleMapLayerChange);
        map.off(customEvents.layerRemoved, handleMapLayerChange);
        map.off(customEvents.layerMoved, handleMapLayerChange);
      };
    }
  }, [map]);
  return <></>;
};

MapSearchOverlayLayer.propTypes = {};

export default MapSearchOverlayLayer;
