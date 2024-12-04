/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilCallback, useRecoilValue } from "recoil";
import { mapState } from "@map/atoms";
import {
  geoJsonLayerViewLayerState,
  geoJsonLayerViewMapFilters,
} from "@map/views/GeoJsonLayerView/atoms";
import { isDefined } from "@util/util";
import { useEffect } from "react";

export const GeoJsonLayerFilterSynchronizer = () => {
  const mapFilters = useRecoilValue(geoJsonLayerViewMapFilters);

  const resetLayerFilterState = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const map = await snapshot.getPromise(mapState);
        const selectedLayer = await snapshot.getPromise(
          geoJsonLayerViewLayerState
        );

        if (isDefined(map) && isDefined(selectedLayer)) {
          selectedLayer.setFilters(map);
        }
      }
  );

  const applyMapFilters = useRecoilCallback(
    ({ snapshot }) =>
      async (mapFilters) => {
        const map = await snapshot.getPromise(mapState);
        const selectedLayer = await snapshot.getPromise(
          geoJsonLayerViewLayerState
        );

        if (isDefined(map) && isDefined(selectedLayer)) {
          selectedLayer.setFilters(map, mapFilters);
        }
      }
  );

  useEffect(() => {
    if (mapFilters === null) {
      resetLayerFilterState();
    } else {
      applyMapFilters(mapFilters);
    }
  }, [mapFilters]);

  useEffect(() => {
    return () => {
      resetLayerFilterState();
    };
  }, []);

  return null;
};
