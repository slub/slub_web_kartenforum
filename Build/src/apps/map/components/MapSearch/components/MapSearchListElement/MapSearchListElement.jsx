/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilCallback } from "recoil";
import {
  mapState,
  selectedGeoJsonLayerIdState,
  selectedLayersState,
} from "@map/atoms";
import MapSearchListElementWithGeometryPreview from "./MapSearchListElementWithGeometryPreview.jsx";
import { fetchWmsTmsSettings } from "@map/components/CustomLayers/HistoricMapLayer/fetchWmsTmsSettings";
import { LAYER_TYPES, METADATA } from "@map/components/CustomLayers";
import { initializeVectorMap } from "@map/components/GeoJson/util/initializeVectorMap.js";

const useMapSearchListElementFunctionality = () => {
  return useRecoilCallback(({ snapshot, set }) => async (layer) => {
    const selectedLayers = await snapshot.getPromise(selectedLayersState);
    const map = await snapshot.getPromise(mapState);

    set(selectedGeoJsonLayerIdState, undefined);

    const selectedLayer = selectedLayers.find(
      (sLayer) => sLayer.getId() === layer.getId()
    );

    // unselect layer if it is already selected
    if (selectedLayer) {
      set(
        selectedLayersState,
        selectedLayers.filter((sLayer) => sLayer.getId() !== layer.getId())
      );

      // use the selected layer and not the layer from the list,
      // to remove layers from the map (might be a different instance, representing the same map)
      selectedLayer.removeMapLibreLayers(map);
      return;
    }

    // select layer
    const type = layer.getMetadata(METADATA.type);

    // TODO IMPLEMENT loading feedback, while layer is added to map
    if (type === LAYER_TYPES.VECTOR_MAP) {
      await initializeVectorMap(layer);
      layer.addLayerToMap(map);
      set(selectedLayersState, (oldSelectedLayers) =>
        oldSelectedLayers.concat(layer)
      );
    } else {
      const sourceSettings = await fetchWmsTmsSettings(layer);

      layer.addLayerToMap(map, { sourceSettings });
      set(selectedLayersState, (oldSelectedLayers) =>
        oldSelectedLayers.concat(layer)
      );
    }
  });
};

export const MapSearchListElement = (props) => {
  const handleElementClick = useMapSearchListElementFunctionality();

  return (
    <MapSearchListElementWithGeometryPreview
      onClick={handleElementClick}
      {...props}
    />
  );
};

MapSearchListElement.propTypes = {
  ...MapSearchListElementWithGeometryPreview.propTypes,
};

export default MapSearchListElement;
