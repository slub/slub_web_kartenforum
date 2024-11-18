/**
 * Created by pouria.rezaei@pikobytes.de on 7/3/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useState } from "react";

import GeoJsonFeaturePanel from "@map/components/GeoJson/GeoJsonFeaturePanel";
import GeoJsonFeatureEditPanel from "@map/components/GeoJson/GeoJsonFeatureEditPanel";

import PropTypes from "prop-types";

import "./GeoJsonFeatureView.scss";

export const GeoJsonFeatureView = ({
  geoJsonFeature,
  saveFeature,
  deleteFeature,
  resetFeature,
  setFeatureState,
  removeFeatureState,
}) => {
  const [showPresentationView, setShowPresentationView] = useState(true);

  /**
   * The close handler for the GeoJsonFeatureEditPanel component.
   * If options.doRemoveFeatureState is set to true, the feature state for the currently selected feature is cleared.
   * The feature state must NOT be cleared when saving the feature data, as this causes a glitch during rendering.
   * @param {object} options
   */
  const handleEditPanelClose = useCallback(
    ({ doRemoveFeatureState } = { doRemoveFeatureState: true }) => {
      if (doRemoveFeatureState) {
        removeFeatureState();
      }
      setShowPresentationView(true);
    },
    [setShowPresentationView, removeFeatureState]
  );

  const handleFeatureSave = useCallback(
    (geoJsonDiff) => {
      const onSuccess = () => {
        handleEditPanelClose({ doRemoveFeatureState: false });
      };

      const onError = () => {
        console.error("The feature could not be saved");
        handleEditPanelClose({ doRemoveFeatureState: false });
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

  const handleShowEditDialog = useCallback(() => {
    setShowPresentationView(false);
  }, [setShowPresentationView]);

  useEffect(() => {
    // always show presentation view when switching geojson features
    if (geoJsonFeature !== null) {
      setShowPresentationView(true);
    }
  }, [geoJsonFeature]);

  return (
    <>
      {showPresentationView && (
        <GeoJsonFeaturePanel
          feature={geoJsonFeature}
          onEdit={handleShowEditDialog}
          onClose={handleOverlayClose}
        />
      )}
      {!showPresentationView && (
        <GeoJsonFeatureEditPanel
          feature={geoJsonFeature}
          onFeatureStateChange={setFeatureState}
          onDelete={handleFeatureDelete}
          onClose={handleEditPanelClose}
          onSave={handleFeatureSave}
        />
      )}
    </>
  );
};

GeoJsonFeatureView.propTypes = {
  geoJsonFeature: PropTypes.object.isRequired,
  saveFeature: PropTypes.func.isRequired,
  deleteFeature: PropTypes.func.isRequired,
  resetFeature: PropTypes.func.isRequired,
  setFeatureState: PropTypes.func.isRequired,
  removeFeatureState: PropTypes.func.isRequired,
};

export default GeoJsonFeatureView;
