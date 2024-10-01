/**
 * Created by nicolas.looschen@pikobytes.de on 03.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import clsx from "clsx";
import PropTypes from "prop-types";
import React, { useEffect, useState, useMemo } from "react";
import { useRecoilValue } from "recoil";

import { mapState } from "../../../../../atoms/atoms.js";
import { CustomEvents } from "../../../../VkfMap/constants";
import { translate } from "../../../../../../../util/util.js";
import { METADATA } from "../../../../CustomLayers";

export const VisibilityButton = (props) => {
  const { layer } = props;

  const layerTitle = layer.getMetadata(METADATA.title);

  const map = useRecoilValue(mapState);

  const initialVisibility = useMemo(() => {
    return layer.isVisible(map);
  }, [layer, map]);

  const [isVisible, setIsVisible] = useState(initialVisibility);

  // change visibility of the layer
  const handleChangeVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsVisible(!isVisible);
    if (map) {
      layer.setVisibility(map, isVisible ? "none" : "visible");
    }
  };

  // Update visibility from layer if it is different from the internal state
  // NOTE gets fired 4 times for a geoJson layer; might be relevant for the dynamic map visualization
  const handleUpdateVisibility = ({ layerId, value }) => {
    if (layerId === layer.getId()) {
      setIsVisible(value === "visible" ? true : false);
    }
  };

  // Add visibility change handler to layer
  useEffect(() => {
    if (map) {
      map.on(CustomEvents.visibilityChanged, handleUpdateVisibility);
      return () => {
        map.off(CustomEvents.visibilityChanged, handleUpdateVisibility);
      };
    }
  }, [map]);

  return (
    <button
      className={clsx(
        "disable-layer minimize-tool",

        isVisible ? "record-visible" : "record-hidden"
      )}
      onClick={handleChangeVisibility}
      type="button"
      title={translate("layermanagement-show-map")}
    >
      {` ${translate("layermanagement-show-map")}: ${layerTitle}`}
    </button>
  );
};

VisibilityButton.propTypes = {
  layer: PropTypes.object,
};

export default VisibilityButton;
