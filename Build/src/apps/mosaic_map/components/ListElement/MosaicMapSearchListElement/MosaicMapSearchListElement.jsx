/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import clsx from "clsx";
import { useRecoilState, useRecoilValue } from "recoil";

import MapSearchListElement from "@map/components/MapSearch/components/MapSearchListElement/MapSearchListElement.jsx";
import { mosaicMapSelectedLayersState } from "@mosaic-map/atoms";
import { checkIfArrayContainsLayer } from "@map/components/MapSearch/util.js";
import { mapState } from "@map/atoms/atoms.js";
import {
  moveMosaicOverlayToTop,
  MOSAIC_MAP_OVERLAY_SOURCE_ID,
} from "@mosaic-map/components/MosaicMapOverlayLayer/MosaicMapOverlayLayer.jsx";

import "./MosaicMapSearchListElement.scss";
import { isDefined } from "@util/util.js";

export const MosaicMapSearchListElement = ({ data, index, style }) => {
  const [selectedMosaicLayers, setSelectedMosaicLayers] = useRecoilState(
    mosaicMapSelectedLayersState
  );

  const map = useRecoilValue(mapState);

  const layer = data.maps[index];
  const isSelected =
    isDefined(layer) && checkIfArrayContainsLayer(selectedMosaicLayers, layer);

  const handleAddClick = (e) => {
    if (isDefined(e)) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (isDefined(layer)) {
      if (!isSelected) {
        setSelectedMosaicLayers((selectedLayers) => [...selectedLayers, layer]);
        layer.addToOverlay(map, MOSAIC_MAP_OVERLAY_SOURCE_ID);
        moveMosaicOverlayToTop(map);
      } else {
        setSelectedMosaicLayers((selectedLayers) =>
          selectedLayers.filter(
            (selectedLayer) => selectedLayer.getId() !== layer.getId()
          )
        );
        layer.removeFromOverlay(map, MOSAIC_MAP_OVERLAY_SOURCE_ID);
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
