/**
 * Created by nicolas.looschen@pikobytes.de on 04.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { isDefined, translate } from "@util/util.js";
import SvgIcons from "@components/SvgIcons";
import React from "react";
import { useRecoilValue } from "recoil";
import { mapState } from "@map/atoms";
import PropTypes from "prop-types";
import { METADATA } from "@map/components/CustomLayers";

export const ZoomToExtentButton = (props) => {
  const { layer } = props;

  const map = useRecoilValue(mapState);

  // zoom to the layer
  const handleZoomToExtent = () => {
    if (isDefined(map)) {
      const extent = layer.getMetadata(METADATA.bounds);
      // add percentage based padding
      //@TODO: Adjust for mobile layout
      map.fitBounds(extent, {
        padding: { left: 350, right: 350, top: 50, bottom: 50 },
        animate: false,
      });
    }
  };

  return (
    <button
      className="zoom-layer minimize-tool"
      onClick={handleZoomToExtent}
      type="button"
      title={translate("layermanagement-zoom-to-map")}
    >
      <SvgIcons name="layeraction-center" />
    </button>
  );
};

ZoomToExtentButton.propTypes = {
  layer: PropTypes.object.isRequired,
};

export default ZoomToExtentButton;
