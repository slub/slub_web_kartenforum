/*
 * Created by tom.schulze@pikobytes.de on 25.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";
import PropTypes from "prop-types";

import GeoJsonFeaturePanel from "@map/components/GeoJson/GeoJsonFeaturePanel";

export const GeoJsonFeaturePanelWrapper = ({
  geoJsonFeature,
  resetFeature,
}) => {
  const handleOverlayClose = useCallback(() => {
    resetFeature();
  }, [resetFeature]);

  return (
    <>
      <GeoJsonFeaturePanel
        feature={geoJsonFeature}
        onClose={handleOverlayClose}
      />
    </>
  );
};

GeoJsonFeaturePanelWrapper.propTypes = {
  geoJsonFeature: PropTypes.object.isRequired,
  resetFeature: PropTypes.func.isRequired,
};

export default GeoJsonFeaturePanelWrapper;
