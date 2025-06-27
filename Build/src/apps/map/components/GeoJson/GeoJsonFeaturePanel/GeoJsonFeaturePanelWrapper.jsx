/*
 * Created by tom.schulze@pikobytes.de on 25.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";
import PropTypes from "prop-types";

import VkfFeaturePanel from "@map/components/GeoJson/GeoJsonFeaturePanel/VkfFeaturePanel/VkfFeaturePanel";
import IdohistFeaturePanel from "@map/components/GeoJson/GeoJsonFeaturePanel/IdohistFeaturePanel/IdohistFeaturePanel";
import { EXTERNAL_CONTENT_TYPES } from "@map/components/CustomLayers";

export const GeoJsonFeaturePanelWrapper = ({
  contentType,
  geoJsonFeature,
  resetFeature,
}) => {
  const handleOverlayClose = useCallback(() => {
    resetFeature();
  }, [resetFeature]);

  if (contentType === EXTERNAL_CONTENT_TYPES.IDOHIST) {
    return (
      <IdohistFeaturePanel
        feature={geoJsonFeature}
        onClose={handleOverlayClose}
      />
    );
  }

  return (
    <>
      <VkfFeaturePanel feature={geoJsonFeature} onClose={handleOverlayClose} />
    </>
  );
};

GeoJsonFeaturePanelWrapper.propTypes = {
  geoJsonFeature: PropTypes.object.isRequired,
  resetFeature: PropTypes.func.isRequired,
  contentType: PropTypes.string.isRequired,
};

export default GeoJsonFeaturePanelWrapper;
