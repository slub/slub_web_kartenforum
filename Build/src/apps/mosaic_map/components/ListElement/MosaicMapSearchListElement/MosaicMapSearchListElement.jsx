/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import clsx from "clsx";
import { useRecoilState } from "recoil";

import MapSearchListElement from "../../../../map/components/MapSearch/components/MapSearchListElement/MapSearchListElement.jsx";
import { mosaicMapSelectedFeaturesState } from "../../../atoms/atoms.js";
import { LAYER_TYPES } from "../../../../map/components/CustomLayers/LayerTypes.js";
import { checkIfArrayContainsFeature } from "../../../../map/components/MapSearch/util.js";

import "./MosaicMapSearchListElement.scss";

export const MosaicMapSearchListElement = ({ data, index, style }) => {
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    mosaicMapSelectedFeaturesState
  );

  const feature = data.maps[index];
  const isSelected =
    feature !== undefined &&
    checkIfArrayContainsFeature(selectedFeatures, feature);

  const handleAddClick = (e) => {
    if (e !== undefined) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (feature !== undefined) {
      const id = `${feature.getId()}_mosaic_map_preview`;
      if (!isSelected) {
        const newFeature = feature.clone();

        // adjust properties to reflect the preview usage
        newFeature.setId(id);
        newFeature.set("layer_type", LAYER_TYPES.PREVIEW);

        setSelectedFeatures((selectedFeatures) => [
          ...selectedFeatures,
          { feature: newFeature, type: LAYER_TYPES.HISTORIC_MAP },
        ]);
      } else {
        setSelectedFeatures((selectedFeatures) =>
          selectedFeatures.filter(
            (selectedFeature) => selectedFeature.feature.getId() !== id
          )
        );
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddClick();
    }
  };

  return (
    <div
      className={clsx(
        "vkf-mosaic-map-result-list-element",
        isSelected && "selected"
      )}
    >
      <MapSearchListElement index={index} data={data} style={style}>
        <button
          className="vkf-add-to-mosaic-map-button"
          onKeyDown={handleKeyDown}
          onClick={handleAddClick}
        >
          <i className="arrow right" />
        </button>
      </MapSearchListElement>
    </div>
  );
};

MosaicMapSearchListElement.propTypes = {
  ...MapSearchListElement.propTypes,
};

export default MosaicMapSearchListElement;
