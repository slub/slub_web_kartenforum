/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { checkIfArrayContainsLayer } from "../../util.js";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import {
  mapState,
  selectedLayersState,
  selectedGeoJsonLayerIdState,
} from "@map/atoms";
import MapSearchListElementWithGeometryPreview from "./MapSearchListElementWithGeometryPreview.jsx";
import { fetchWmsTmsSettings } from "@map/components/CustomLayers/HistoricMapLayer/fetchWmsTmsSettings";

export const MapSearchListElement = (props) => {
  const map = useRecoilValue(mapState);
  const [selectedLayers, setSelectedLayers] =
    useRecoilState(selectedLayersState);

  const setSelectedGeoJsonLayerId = useSetRecoilState(
    selectedGeoJsonLayerIdState
  );

  ////
  // Handler section
  ////

  // Toggle selected state of layer and update global state
  const handleElementClick = (layer) => {
    // close GeoJsonLayerPanel in case it's visible
    setSelectedGeoJsonLayerId(undefined);

    const containsLayer = checkIfArrayContainsLayer(selectedLayers, layer);

    // remove layer if it is already contained
    if (containsLayer) {
      // remove from selectedLayers list
      setSelectedLayers((oldSelectedLayers) =>
        oldSelectedLayers.filter(
          (oldLayer) => oldLayer.getId() !== layer.getId()
        )
      );

      layer.removeMapLibreLayers(map);
    } else {
      //@TODO: Add loading feedback, while layer is added to map
      fetchWmsTmsSettings(layer).then((sourceSettings) => {
        layer.addLayerToMap(map, { sourceSettings });
        setSelectedLayers((oldSelectedLayers) => [...oldSelectedLayers, layer]);
      });
    }
  };

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
