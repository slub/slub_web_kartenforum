/*
 * Created by tom.schulze@pikobytes.de on 25.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";
import PropTypes from "prop-types";

import GeoJsonFeatureEditPanel from "@map/components/GeoJson/GeoJsonFeatureEditPanel";

export const GeoJsonFeatureEditPanelWrapper = ({
  geoJsonFeature,
  saveFeature,
  deleteFeature,
  resetFeature,
}) => {
  const handleClose = useCallback(() => {
    resetFeature();
  }, [resetFeature]);

  const handleFeatureSave = useCallback(
    (geoJsonDiff) => {
      const onSuccess = () => {
        handleClose();
      };

      const onError = () => {
        console.error("The feature could not be saved");
        handleClose();
      };

      saveFeature(geoJsonDiff, onSuccess, onError);
    },
    [saveFeature]
  );

  const handleFeatureDelete = useCallback(() => {
    const onDone = () => handleOverlayClose();
    deleteFeature(onDone);
  }, [deleteFeature]);

  const handleOverlayClose = useCallback(() => {
    resetFeature();
  }, [resetFeature]);

  return (
    <>
      <GeoJsonFeatureEditPanel
        feature={geoJsonFeature}
        onDelete={handleFeatureDelete}
        onClose={handleClose}
        onSave={handleFeatureSave}
      />
    </>
  );
};

GeoJsonFeatureEditPanelWrapper.propTypes = {
  geoJsonFeature: PropTypes.object.isRequired,
  resetFeature: PropTypes.func.isRequired,
  saveFeature: PropTypes.func.isRequired,
  deleteFeature: PropTypes.func.isRequired,
};

export default GeoJsonFeatureEditPanelWrapper;
