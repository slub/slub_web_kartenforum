/**
 * Created by nicolas.looschen@pikobytes.de on 13.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import {
  addWMSLayer,
  addXYZLayer,
  removeWMSLayer,
  removeXYZLayer,
  showVectorBaseMapLayer,
} from "@map/components/BasemapSelectorControl/util.js";
import { useRecoilValue } from "recoil";
import {
  activeBasemapIdState,
  baseMapStyleLayersState,
  mapState,
} from "@map/atoms";
import { useEffect, useMemo } from "react";
import { useLocalStorage } from "@map/persistence/util.js";
import { PERSISTENCE_CUSTOM_BASEMAP_KEYS } from "@map/components/BasemapSelectorControl/BasemapSelectorDialog.jsx";
import SettingsProvider from "@settings-provider";
import { isDefined } from "@util/util.js";

export const BasemapLayerApplier = () => {
  const map = useRecoilValue(mapState);
  const activeBasemapId = useRecoilValue(activeBasemapIdState);
  const baseMapStyleLayers = useRecoilValue(baseMapStyleLayersState);
  const [customLayers] = useLocalStorage(PERSISTENCE_CUSTOM_BASEMAP_KEYS, []);

  const defaultLayers = SettingsProvider.getBaseMaps();

  const layers = useMemo(() => {
    return [...defaultLayers, ...customLayers];
  }, [customLayers, defaultLayers]);

  useEffect(() => {
    if (isDefined(map)) {
      const activeLayer = layers.find((layer) => layer.id === activeBasemapId);
      if (activeLayer === undefined) {
        return;
      }
      const newLayer = activeLayer;

      // Remove previous custom layers
      removeWMSLayer(map);
      removeXYZLayer(map);

      // Handle the change of the new layer
      // Currently we expect there to be only a single allowed vector style in the basemaps
      if (newLayer.type === "vector") {
        showVectorBaseMapLayer(map, baseMapStyleLayers);
      } else if (newLayer.type === "wms") {
        addWMSLayer(map, newLayer, baseMapStyleLayers);
      } else if (newLayer.type === "xyz") {
        addXYZLayer(map, newLayer, baseMapStyleLayers);
      } else {
        throw new Error("Unknown layer type");
      }
    }
  }, [activeBasemapId, map, baseMapStyleLayers]);

  return null;
};

export default BasemapLayerApplier;
