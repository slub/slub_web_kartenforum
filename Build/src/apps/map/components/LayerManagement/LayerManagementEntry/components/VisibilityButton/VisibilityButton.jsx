/**
 * Created by nicolas.looschen@pikobytes.de on 03.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "../../../../../../../util/util.js";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useRecoilValue } from "recoil";
import { mapState } from "../../../../../atoms/atoms.js";
import customEvents from "../../../../MapWrapper/customEvents.js";
import PropTypes from "prop-types";

export const VisibilityButton = (props) => {
  const { layer } = props;

  const layerTitle = layer.metadata["vkf:title"];

  const [isVisible, setIsVisible] = useState(
    layer?.layout?.visibility === undefined
      ? true
      : layer.layout.visibility === "visible"
  );
  const map = useRecoilValue(mapState);

  // change visibility of the layer
  const handleChangeVisibility = () => {
    setIsVisible(!isVisible);
    if (map) {
      map.setLayoutProperty(
        layer.id,
        "visibility",
        isVisible ? "none" : "visible"
      );
    }
  };

  // Update visibility from layer if it is different from the internal state
  const handleUpdateVisibility = ({ layerId, value }) => {
    if (layerId === layer.id) {
      setIsVisible(value === "visible" ? true : false);
    }
  };

  // Add visibility change handler to layer
  useEffect(() => {
    if (map) {
      map.on(customEvents.visibilityChanged, handleUpdateVisibility);
      return () => {
        map.off(customEvents.visibilityChanged, handleUpdateVisibility);
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
