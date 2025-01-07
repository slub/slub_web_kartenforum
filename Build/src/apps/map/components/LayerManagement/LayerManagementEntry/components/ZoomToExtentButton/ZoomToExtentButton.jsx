/**
 * Created by nicolas.looschen@pikobytes.de on 04.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "@util/util.js";
import SvgIcons from "@components/SvgIcons";
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import useZoomLayerToExtent from "./useZoomLayerToExtent";

export const ZoomToExtentButton = (props) => {
  const { layer } = props;

  const { zoomToExtent } = useZoomLayerToExtent();

  // zoom to the layer
  const handleZoomToExtent = useCallback(() => {
    zoomToExtent(layer);
  }, [zoomToExtent, layer]);

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
