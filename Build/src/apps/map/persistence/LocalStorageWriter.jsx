/**
 * Created by nicolas.looschen@pikobytes.de on 20.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import {
  serializeCameraOptions,
  serializeOperationalLayer,
  useLocalStorage,
  useOnPageLeave,
} from "./util.js";
import {
  activeBasemapIdState,
  facetState,
  currentApplicationStateState,
  mapState,
  selectedLayersState,
  timeExtentState,
  timeRangeState,
} from "@map/atoms";
import { PERSISTENCE_OBJECT_KEY } from "./PersistenceController.jsx";

export const LocalStorageWriter = function () {
  //@TODO: Refactor this to be a recoil callback
  const activeBasemapId = useRecoilValue(activeBasemapIdState);
  const facets = useRecoilValue(facetState);
  const map = useRecoilValue(mapState);
  const timeExtent = useRecoilValue(timeExtentState);
  const timeRange = useRecoilValue(timeRangeState);
  const selectedLayers = useRecoilValue(selectedLayersState);
  const setLocalStorageWriter = useSetRecoilState(currentApplicationStateState);

  const [, setPersistenceObject] = useLocalStorage(PERSISTENCE_OBJECT_KEY, {
    operationalLayers: [],
    is3dEnabled: false,
  });

  // Persist current state to localStorage
  const writeStateToLocalStorage = useCallback(() => {
    if (map !== undefined) {
      const mapIs3dEnabled = map.isVkfGlobeModeEnabled();

      // Persist basic feature settings
      const newPersistenceObject = {
        activeBasemapId,
        is3dEnabled: mapIs3dEnabled,
        operationalLayers: selectedLayers
          .map((selectedLayer) => {
            return serializeOperationalLayer(selectedLayer, map);
          })
          .filter((layer) => layer !== null),
        searchOptions: {
          facets,
          timeExtent,
          timeRange,
        },
      };

      // Persist map view
      newPersistenceObject.cameraOptions = serializeCameraOptions(map);

      // write changes to localStorage
      setPersistenceObject(newPersistenceObject);

      return newPersistenceObject;
    }
  }, [activeBasemapId, map, facets, selectedLayers, timeExtent, timeRange]);

  // Write state on page leave to storage
  useOnPageLeave(writeStateToLocalStorage);

  useEffect(() => {
    setLocalStorageWriter(() => writeStateToLocalStorage);
  }, [writeStateToLocalStorage]);

  return <></>;
};

export default LocalStorageWriter;
