/**
 * Created by pouria.rezaei@pikobytes.de on 10/22/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";

import { translate } from "@util/util";

import { buildGeoJSONSourceDiff } from "../util/util";

import VkfIcon from "@components/VkfIcon";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";

import CustomButton from "../components/CustomButton";
import DangerZone from "../components/DangerZone";

import DeleteDialog from "./DeleteDialog";
import FeaturePropertiesForm from "./FeaturePropertiesForm";

import "./GeoJsonFeatureEditPanel.scss";

export const FEATURE_PROPERTIES_FORM_ID = "feature-properties-form";

const GeoJsonEditPopUp = (props) => {
  const { feature, onDelete, onClose, onSave, onSavePreview } = props;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleClose = useCallback(() => {
    onClose({ doRemoveFeatureState: true });
  }, [onClose]);

  const toggleDeleteDialog = useCallback(() => {
    setShowDeleteDialog((prev) => !prev);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
  }, [setShowDeleteDialog]);

  const handleConfirmDelete = useCallback(() => {
    onDelete(feature);
    toggleDeleteDialog();
  }, [onDelete, feature, toggleDeleteDialog]);

  const handleFormSubmit = useCallback((newProperties) => {
    const geoJSONSourceDiff = buildGeoJSONSourceDiff({
      oldProperties: feature.properties,
      newProperties,
    });
    onSave(geoJSONSourceDiff);
  }, []);

  return (
    <div className="geojson-feature-edit-panel-root vkf-geojson-feature-view-content full-height">
      <GeoJsonPanelHeader
        title={translate("geojson-editview-header-text")}
        onCloseClick={onClose}
      />
      <div className="geojson-feature-edit-panel-content">
        <div className="introduction-text">
          {translate("geojson-editview-intro-text")}
        </div>

        <FeaturePropertiesForm
          feature={feature}
          onFormSubmit={handleFormSubmit}
          onSavePreview={onSavePreview}
        />

        <div className="danger-zone-container">
          <DangerZone
            description={translate("geojson-editfeature-danger-zone-title")}
            onDeleteClick={toggleDeleteDialog}
            buttonLabel={translate("geojson-featureview-delete-btn")}
          />
        </div>
      </div>
      <div className="footer-container">
        <CustomButton
          form={FEATURE_PROPERTIES_FORM_ID}
          className="save-button"
          type="save"
        >
          <VkfIcon name="save" />
          {translate("geojson-apply-btn")}
        </CustomButton>
        <CustomButton
          className="discard-button"
          onClick={handleClose}
          type="discard"
        >
          <VkfIcon name="discard" />
          {translate("geojson-cancel-btn")}
        </CustomButton>
      </div>

      <DeleteDialog
        show={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onDelete={handleConfirmDelete}
        description={translate("geojson-deletemodal-body")}
      />
    </div>
  );
};

GeoJsonEditPopUp.defaultPropTypes = {
  onSavePreview: () => {},
};

GeoJsonEditPopUp.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    geometry: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSavePreview: PropTypes.func,
};

export default GeoJsonEditPopUp;
