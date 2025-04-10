/*
 * Created by tom.schulze@pikobytes.de on 19.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useEffect } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import { isDefined } from "@util/util";
import {
  drawModePanelState,
  drawState,
  initialGeoJsonDrawState,
  mapState,
  selectedGeoJsonLayerState,
} from "@map/atoms";

import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";
import { exitDrawMode } from "../util/util";
import { useTrackGeoJsonChanges } from "@map/components/GeoJson/util/hooks/useTrackGeoJsonChanges";
import { styles } from "./constants";

import "./mapbox-draw-cursors.scss";

const options = {
  styles,
  userProperties: true,
  controls: {
    combine_features: false,
    uncombine_features: false,
  },
};

const CSS_CLASS_DRAW = "draw";
const CSS_CLASS_POSITION_MODIFIER = "shifted";
const POSITION = {
  LEFT: "left",
  RIGHT: "right",
};

const SELECTORS = {
  topLeft: ".maplibregl-ctrl-top-left",
  topRight: ".maplibregl-ctrl-top-right",
  bottomRight: ".maplibregl-ctrl-bottom-right",
};

const getDynamicSelectors = (isLeft) => {
  const add = isLeft ? SELECTORS.topLeft : SELECTORS.topRight;
  const remove = isLeft ? SELECTORS.topRight : SELECTORS.topLeft;

  return {
    add,
    remove,
  };
};

const wrapDrawButtons = (map) => {
  const drawControlElement = map._controlContainer.querySelector(
    SELECTORS.topRight
  );
  const drawButtons = drawControlElement.querySelectorAll("button");

  for (const element of drawButtons) {
    const wrapperDiv = document.createElement("div");

    wrapperDiv.classList.add("maplibregl-ctrl", "maplibregl-ctrl-group");
    element.before(wrapperDiv);

    wrapperDiv.appendChild(element);
  }
};

export const useMapboxDrawInitializers = () => {
  const initializeDraw = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const map = await snapshot.getPromise(mapState);
        const geoJson = await snapshot.getPromise(initialGeoJsonDrawState);

        if (isDefined(map) && isDefined(geoJson)) {
          const draw = new MapboxDraw(options);
          set(drawState, draw);
          map.addControl(draw, "top-right");
          draw.add(geoJson);

          // add css class to control container for position handling
          map._controlContainer.classList.add(CSS_CLASS_DRAW);

          // wrap buttons for styling
          wrapDrawButtons(map);
        }
      },
    []
  );

  const removeDraw = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
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

          map._controlContainer.classList.remove(CSS_CLASS_DRAW);

          // reset draw related state variables
          exitDrawMode(set);
        }
      },
    []
  );

  return { initializeDraw, removeDraw };
};

const useMaplibreControlPositions = () => {
  const shiftControls = useRecoilCallback(
    ({ snapshot }) =>
      async (leftOrRight) => {
        const map = await snapshot.getPromise(mapState);

        if (isDefined(map)) {
          const isLeft = leftOrRight === POSITION.LEFT;
          const { add, remove } = getDynamicSelectors(isLeft);

          const element = map._controlContainer.querySelector(add);
          element.classList.add(CSS_CLASS_POSITION_MODIFIER);

          const elementRemove = map._controlContainer.querySelector(remove);
          elementRemove.classList.remove(CSS_CLASS_POSITION_MODIFIER);

          const attributionElement = map._controlContainer.querySelector(
            SELECTORS.bottomRight
          );

          if (!isLeft) {
            attributionElement.classList.add(CSS_CLASS_POSITION_MODIFIER);
          } else {
            attributionElement.classList.remove(CSS_CLASS_POSITION_MODIFIER);
          }
        }
      },
    []
  );

  const removeControlShifts = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const map = await snapshot.getPromise(mapState);
        if (isDefined(map)) {
          for (const selector of Object.values(SELECTORS)) {
            const element = map._controlContainer.querySelector(selector);
            element.classList.remove(CSS_CLASS_POSITION_MODIFIER);
          }
        }
      },
    []
  );

  return { shiftControls, removeControlShifts };
};

const MapboxDrawLoader = () => {
  const drawModePanel = useRecoilValue(drawModePanelState);

  const { initializeDraw, removeDraw } = useMapboxDrawInitializers();
  const { shiftControls, removeControlShifts } = useMaplibreControlPositions();

  const { registerMapEventHandler, unregisterMapEventHandler } =
    useTrackGeoJsonChanges();

  useEffect(() => {
    initializeDraw();
    registerMapEventHandler();
    return () => {
      removeDraw();
      removeControlShifts();
      unregisterMapEventHandler();
    };
  }, []);

  useEffect(() => {
    const leftPanelOpen = drawModePanel === DRAW_MODE_PANEL_STATE.FEATURE;
    const rightPanelOpen =
      drawModePanel === DRAW_MODE_PANEL_STATE.METADATA ||
      drawModePanel === DRAW_MODE_PANEL_STATE.HISTORY;

    if (leftPanelOpen) {
      shiftControls(POSITION.LEFT);
    } else if (rightPanelOpen) {
      shiftControls(POSITION.RIGHT);
    } else {
      removeControlShifts();
    }
  }, [drawModePanel]);

  return null;
};

export default MapboxDrawLoader;
