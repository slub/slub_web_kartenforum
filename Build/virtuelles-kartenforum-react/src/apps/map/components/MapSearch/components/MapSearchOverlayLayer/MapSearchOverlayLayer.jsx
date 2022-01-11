/**
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";

import {
  map3dState,
  mapSearchOverlayLayerState,
  mapState,
} from "../../../../atoms/atoms";
import HistoricMap from "../../../CustomLayers/HistoricMapLayer";
import { MAP_SEARCH_HOVER_FEATURE } from "../../../../config/styles";
import { isDefined } from "../../../../../../util/util";

export const MapSearchOverlayLayer = () => {
  // State
  const is3dEnabled = useRecoilValue(map3dState);
  const map = useRecoilValue(mapState);
  const [mapOverlayLayer, setMapOverlayLayer] = useRecoilState(
    mapSearchOverlayLayerState
  );

  ////
  // Handler section
  ////

  // keep the overlay layer on top of the map layer stack
  const handleMapLayerChange = useCallback(
    (event) => {
      const topLayer = event.target.getArray().at(-1);

      if (topLayer instanceof HistoricMap || topLayer.get("type") === "click") {
        map.removeLayer(mapOverlayLayer);
        map.addLayer(mapOverlayLayer);
      }
    },
    [map, mapOverlayLayer]
  );

  ////
  // Effect section
  ////

  // Add feature overlay layer shown on hover and the source for the backend fatches
  useEffect(() => {
    if (map !== undefined) {
      const newMapOverlayLayer = new VectorLayer({
        source: new VectorSource(),
        style: function () {
          return [MAP_SEARCH_HOVER_FEATURE];
        },
      });

      map.addLayer(newMapOverlayLayer);

      setMapOverlayLayer(newMapOverlayLayer);
    }
  }, [map]);

  // Update featureOverlay on change of 3d state
  useEffect(() => {
    if (is3dEnabled && isDefined(mapOverlayLayer)) {
      // in case 3d mode is active add altitude value to coordinate
      mapOverlayLayer.set("altitudeMode", "clampToGround");
    }
  }, [is3dEnabled, mapOverlayLayer]);

  // Add map handler to keep overlay layer on top of the layer stack
  useEffect(() => {
    // hold the overlay layer on top of the historic map layers
    if (isDefined(map) && isDefined(mapOverlayLayer)) {
      map.getLayers().on("add", handleMapLayerChange);
    }
  }, [mapOverlayLayer, map, handleMapLayerChange]);
  return <></>;
};

MapSearchOverlayLayer.propTypes = {
  onUpdate: PropTypes.func,
};

export default MapSearchOverlayLayer;
