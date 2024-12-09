/*
 * Created by tom.schulze@pikobytes.de on 05.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useEffect, useRef } from "react";
import { useRecoilValue, useRecoilCallback } from "recoil";

import { isDefined } from "@util/util";

import { mapState, drawModePanelState, drawState } from "@map/atoms";
import useGeoJsonFeatureDraw, {
  geoJsonFeatureDrawState,
} from "./useGeoJsonFeatureDraw";

import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";

const USER_PROPERTY_PREFIX = "user_";
const DRAW_LAYER = {
  HOT: "mapbox-gl-draw-hot",
  COLD: "mapbox-gl-draw-cold",
};
const MODE = {
  DIRECT_SELECT: "direct_select",
  SIMPLE_SELECT: "simple_select",
  DRAW_POLYGON: "draw_polygon",
  DRAW_LINE_STRING: "draw_line_string",
};

const isDrawingFeature = (feature) => {
  const { source } = feature;
  const { properties } = feature;

  const { meta, mode } = properties;

  const isDrawingSource =
    (source === DRAW_LAYER.COLD || source === DRAW_LAYER.HOT) &&
    meta === "feature";

  const isNotBeingDrawn =
    mode === MODE.DIRECT_SELECT || mode === MODE.SIMPLE_SELECT;

  return isDrawingSource && isNotBeingDrawn;
};

const getApplicationFeature = (drawFeature) => {
  const { properties, type, geometry } = drawFeature;
  const { id } = properties;

  // retain user properties only and remove prefix
  const userProperties = Object.entries(properties)
    .filter(([key]) => key.startsWith(USER_PROPERTY_PREFIX))
    .map(([key, value]) => {
      const userKey = key.slice(USER_PROPERTY_PREFIX.length);
      return [userKey, value];
    });

  return {
    id,
    geometry,
    properties: Object.fromEntries(userProperties),
    type,
  };
};

const calculateBoundingBox = (point, offset) => {
  const { x, y } = point;
  return [
    [x - offset, y - offset],
    [x + offset, y + offset],
  ];
};

// https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md
const CLICK_BUFFER = 2;

const GeoJsonFeatureDrawLoader = () => {
  const { setFeature, resetFeature, resetFeaturePreview } =
    useGeoJsonFeatureDraw();
  const drawModePanel = useRecoilValue(drawModePanelState);

  // mabox draw.create event does not provide the original event
  // we need the flag to skip reset in handleMapClick
  const blockFeatureReset = useRef(false);

  const handleMapClick = useRecoilCallback(
    ({ snapshot, set }) =>
      /**
       *  @param {maplibregl.MapMouseEvent} event
       */
      async (event) => {
        const map = await snapshot.getPromise(mapState);
        const draw = await snapshot.getPromise(drawState);

        const geoJsonFeature = await snapshot.getPromise(
          geoJsonFeatureDrawState
        );

        const { point } = event;
        const boxAroundPoint = calculateBoundingBox(point, CLICK_BUFFER);

        const drawFeature = map
          .queryRenderedFeatures(boxAroundPoint)
          .filter(isDrawingFeature)
          .at(0);

        if (isDefined(drawFeature)) {
          const { id } = drawFeature.properties;

          if (geoJsonFeature?.id === id) {
            return;
          }

          // reset previewed properties from feature before
          // when switching features on click directly
          resetFeaturePreview();
          setFeature(getApplicationFeature(drawFeature));
          set(drawModePanelState, DRAW_MODE_PANEL_STATE.FEATURE);
        } else {
          if (isDefined(geoJsonFeature) && !blockFeatureReset.current) {
            if (
              [MODE.DRAW_LINE_STRING, MODE.DRAW_POLYGON].includes(
                draw.getMode()
              )
            ) {
              resetFeature({ skipDeselect: true });
            } else {
              resetFeature();
            }
          }

          blockFeatureReset.current = false;
        }
      },
    [setFeature, resetFeature, resetFeaturePreview]
  );

  const handleDrawDelete = useCallback(() => {
    resetFeature();
  }, [resetFeature]);

  const handleDrawCreate = useRecoilCallback(
    ({ set }) =>
      (event) => {
        blockFeatureReset.current = true;
        const drawFeature = event.features[0];
        setFeature(drawFeature);
        set(drawModePanelState, DRAW_MODE_PANEL_STATE.FEATURE);
      },
    [setFeature]
  );

  const registerMapHandler = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const map = await snapshot.getPromise(mapState);

        if (isDefined(map)) {
          map.on("click", handleMapClick);
          map.on("draw.delete", handleDrawDelete);
          map.on("draw.create", handleDrawCreate);
        }
      },
    []
  );

  const unregisterMapHandler = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const map = await snapshot.getPromise(mapState);

        if (isDefined(map)) {
          map.off("click", handleMapClick);
          map.off("draw.delete", handleDrawDelete);
          map.off("draw.create", handleDrawCreate);
        }
      },
    []
  );

  const handleDrawPanelChange = useRecoilCallback(
    ({ snapshot }) =>
      async (drawModePanel) => {
        const geoJsonFeature = await snapshot.getPromise(
          geoJsonFeatureDrawState
        );

        if (
          isDefined(geoJsonFeature) &&
          drawModePanel !== DRAW_MODE_PANEL_STATE.FEATURE
        ) {
          resetFeature({ skipPanelState: true });
        }
      },
    [resetFeature]
  );

  useEffect(() => {
    registerMapHandler();

    return () => {
      unregisterMapHandler();
    };
  }, []);

  // when another panel opens, clear the feature state
  useEffect(() => {
    handleDrawPanelChange(drawModePanel);
  }, [drawModePanel, handleDrawPanelChange]);

  return <></>;
};

export default GeoJsonFeatureDrawLoader;
