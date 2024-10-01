/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { checkIfArrayContainsLayer } from "../../util.js";
import { useRecoilState, useRecoilValue } from "recoil";
import { mapState, selectedLayersState } from "../../../../atoms/atoms.js";
import MapSearchListElementWithGeometryPreview from "./MapSearchListElementWithGeometryPreview.jsx";

export const MapSearchListElement = (props) => {
  const map = useRecoilValue(mapState);
  const [selectedLayers, setSelectedLayers] =
    useRecoilState(selectedLayersState);

  ////
  // Handler section
  ////

  // Toggle selected state of layer and update global state
  const handleElementClick = (layer) => {
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
      layer.addLayerToMap(map).then(() => {
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
