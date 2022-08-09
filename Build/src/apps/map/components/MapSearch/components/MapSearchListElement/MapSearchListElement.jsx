/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { checkIfArrayContainsFeature } from "../../util.js";
import { LAYER_TYPES } from "../../../CustomLayers/LayerTypes.js";
import { useRecoilState, useRecoilValue } from "recoil";
import { mapState, selectedFeaturesState } from "../../../../atoms/atoms.js";
import MapSearchListElementWithGeometryPreview from "./MapSearchListElementWithGeometryPreview.jsx";

export const MapSearchListElement = (props) => {
  const map = useRecoilValue(mapState);
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );

  ////
  // Handler section
  ////

  // Toggle selected state of fature and update global state
  const handleElementClick = (feature) => {
    const containsFeature = checkIfArrayContainsFeature(
      selectedFeatures,
      feature
    );

    // remove feature if it is already contained
    if (containsFeature) {
      // remove from selectedFeaturesList
      setSelectedFeatures((selectedFeatures) =>
        selectedFeatures.filter(
          ({ feature: selFeature }) =>
            selFeature.get("id") !== feature.get("id")
        )
      );

      // remove map layer
      const layers = map
        .getLayers()
        .getArray()
        .filter((lay) => lay.allowUseInLayerManagement);
      const layer = layers.find((layer) => {
        return layer.getId() === feature.get("id");
      });

      map.removeLayer(layer);
    } else {
      setSelectedFeatures((selectedFeatures) => [
        ...selectedFeatures,
        { feature, type: LAYER_TYPES.HISTORIC_MAP },
      ]);
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
