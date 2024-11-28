/*
 * Created by tom.schulze@pikobytes.de on 19.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useEffect } from "react";
import { useRecoilCallback } from "recoil";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import { isDefined } from "@util/util";
import {
  drawState,
  editedGeojsonState,
  mapState,
  selectedGeoJsonLayerState,
} from "@map/atoms";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./MapboxDrawLoader.scss";

const options = {
  userProperties: true,
  controls: {
    combine_features: false,
    uncombine_features: false,
  },
};

export const useMapboxDrawInitializers = () => {
  const initializeDraw = useRecoilCallback(({ snapshot, set }) => async () => {
    const map = await snapshot.getPromise(mapState);
    const geoJson = await snapshot.getPromise(editedGeojsonState);

    if (isDefined(map) && isDefined(geoJson)) {
      const draw = new MapboxDraw(options);
      set(drawState, draw);
      map.addControl(draw, "top-right");

      draw.add(geoJson);
    }
  });

  const removeDraw = useRecoilCallback(({ snapshot, set }) => async () => {
    const map = await snapshot.getPromise(mapState);
    const draw = await snapshot.getPromise(drawState);
    const { selectedLayer } = await snapshot.getPromise(
      selectedGeoJsonLayerState
    );

    // reset visibility state of selected layer
    if (
      isDefined(map) &&
      isDefined(selectedLayer) &&
      !selectedLayer.isVisible(map)
    ) {
      selectedLayer.setVisibility(map, "visible");
    }

    // remove draw control
    if (isDefined(map) && isDefined(draw)) {
      map.removeControl(draw);
      set(drawState, undefined);
    }
  });

  return { initializeDraw, removeDraw };
};

// TODO DRAWING: define event handlers when hovering over features (when layer styles are defined)

const MapboxDrawLoader = () => {
  const { initializeDraw, removeDraw } = useMapboxDrawInitializers();

  useEffect(() => {
    initializeDraw();
    return () => {
      removeDraw();
    };
  }, []);

  return null;
};

export default MapboxDrawLoader;
