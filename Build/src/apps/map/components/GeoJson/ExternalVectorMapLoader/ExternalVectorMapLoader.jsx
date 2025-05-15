/*
 * Created by tom.schulze@pikobytes.de on 06.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useEffect } from "react";
import { useRecoilValue, useRecoilCallback } from "recoil";
import {
  vectorMapExternalModePanelState,
  mapState,
  horizontalLayoutModeState,
  layerExternalVectorMapState,
  selectedGeoJsonLayerState,
  vectorMapExternalInitialBoundsState,
} from "@map/atoms";
import {
  useMaplibreControlPositions,
  CSS_CLASS_POSITION_CONTROL,
} from "@map/components/GeoJson/util/hooks/useMaplibreControlPositions";
import {
  HORIZONTAL_LAYOUT_MODE,
  VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE,
} from "@map/layouts/util";
import { isDefined } from "@util/util";

export const useVectorMapExternalModeInitializers = () => {
  // reset external vector map mode state
  const exitExternalVectorLayerMode = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({ isDiscard = false } = {}) => {
        const map = await snapshot.getPromise(mapState);
        const temporaryLayer = await snapshot.getPromise(
          layerExternalVectorMapState
        );
        const { selectedLayer } = await snapshot.getPromise(
          selectedGeoJsonLayerState
        );

        const initialBounds = await snapshot.getPromise(
          vectorMapExternalInitialBoundsState
        );

        if (!isDefined(map) || !isDefined(temporaryLayer)) {
          return;
        }

        if (isDefined(selectedLayer) && !selectedLayer.isVisible(map)) {
          selectedLayer.setVisibility(map, "visible");
        }

        // remove layer from map
        temporaryLayer.removeMapLibreLayers(map);

        // if user exits by discarding data, reset map to initial bounds
        if (isDiscard === true) {
          map.fitBounds(initialBounds, { animate: false });
        }

        // unmount components before resetting state
        set(horizontalLayoutModeState, HORIZONTAL_LAYOUT_MODE.STANDARD);

        set(vectorMapExternalInitialBoundsState, null);
        set(layerExternalVectorMapState, null);
        set(
          vectorMapExternalModePanelState,
          VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE.NONE
        );
      },
    []
  );

  const initializeVectorMapExternalMode = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const map = await snapshot.getPromise(mapState);

        if (isDefined(map)) {
          // add css class to control container for position handling
          map._controlContainer.classList.add(CSS_CLASS_POSITION_CONTROL);
          set(vectorMapExternalInitialBoundsState, map.getBounds());
        }
      },
    []
  );

  // should not be necessary to call imperatively
  // gets called implicitly in effect cleanup when HORIZONTAL_LAYOUT_MODE changes
  // use exitExternalVectorLayerMode to cleanup imperatively
  const removeVectorMapExternalMode = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const map = await snapshot.getPromise(mapState);

        // remove draw control
        if (isDefined(map)) {
          map._controlContainer.classList.remove(CSS_CLASS_POSITION_CONTROL);
        }

        exitExternalVectorLayerMode();
      },
    []
  );

  return {
    initializeVectorMapExternalMode,
    removeVectorMapExternalMode,
    exitExternalVectorLayerMode,
  };
};

// initializes HORIZONTAL_LAYOUT_MODE.VECTOR_MAP_EXTERNAL
const VectorMapExternalLoader = () => {
  const externalModePanel = useRecoilValue(vectorMapExternalModePanelState);

  const { shiftRight, unShiftLeft, unShiftRight, removeControlShifts } =
    useMaplibreControlPositions();
  const { initializeVectorMapExternalMode, removeVectorMapExternalMode } =
    useVectorMapExternalModeInitializers();

  useEffect(() => {
    initializeVectorMapExternalMode();
    unShiftLeft();
    return () => {
      removeControlShifts();
      removeVectorMapExternalMode();
    };
  }, []);

  useEffect(() => {
    const rightPanelOpen =
      externalModePanel === VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE.METADATA;

    if (rightPanelOpen) {
      shiftRight();
    } else {
      unShiftRight();
    }
  }, [externalModePanel]);

  return null;
};

export default VectorMapExternalLoader;
