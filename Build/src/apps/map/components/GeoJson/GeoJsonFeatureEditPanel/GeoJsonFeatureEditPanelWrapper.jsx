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
  saveFeaturePreview,
  deleteFeature,
  resetFeature,
}) => {
  const handleClose = useCallback(
    (resetOptions) => {
      resetFeature(resetOptions);
    },
    [resetFeature]
  );

  const handleFeatureSave = useCallback(
    (geoJsonDiff) => {
      const onSuccess = () => {
        handleClose({ skipResetPreview: true });
      };

      const onError = () => {
        console.error("The feature could not be saved");
        handleClose();
      };

      saveFeature(geoJsonDiff, onSuccess, onError);
    },
    [saveFeature, handleClose]
  );

  const handleFeatureSavePreview = useCallback(
    ([key, value]) => {
      saveFeaturePreview(key, value);
    },
    [saveFeaturePreview]
  );

  const handleFeatureDelete = useCallback(() => {
    const onDone = () => handleClose();
    deleteFeature(onDone);
  }, [deleteFeature, handleClose]);

  return (
    <>
      <GeoJsonFeatureEditPanel
        feature={geoJsonFeature}
        onDelete={handleFeatureDelete}
        onClose={handleClose}
        onSave={handleFeatureSave}
        onSavePreview={handleFeatureSavePreview}
      />
    </>
  );
};

GeoJsonFeatureEditPanelWrapper.defaultPropTypes = {
  saveFeaturePreview: () => {},
};

GeoJsonFeatureEditPanelWrapper.propTypes = {
  geoJsonFeature: PropTypes.object.isRequired,
  resetFeature: PropTypes.func.isRequired,
  saveFeature: PropTypes.func.isRequired,
  deleteFeature: PropTypes.func.isRequired,
  saveFeaturePreview: PropTypes.func,
};

export default GeoJsonFeatureEditPanelWrapper;
