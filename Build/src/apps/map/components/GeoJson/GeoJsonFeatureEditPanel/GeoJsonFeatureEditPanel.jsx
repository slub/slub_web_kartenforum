/**
 * Created by pouria.rezaei@pikobytes.de on 10/22/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

import { isDefined, translate } from "@util/util";
import { predefinedFieldSettings, styleFieldSettings } from "../constants";
import {
  extractAndSortNonStyleProperties,
  extractStyleProperties,
  buildGeoJSONSourceDiff,
} from "../util/util";

import VkfIcon from "@components/VkfIcon";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";

import CustomButton from "../components/CustomButton";
import DangerZone from "../components/DangerZone";

import DeleteDialog from "./DeleteDialog";
import NewField from "./NewField/NewField";
import EditStyleField from "./EditStyleField/EditStyleField";
import EditNonStyleField from "./EditNonStyleField/EditNonStyleField";

import "./GeoJsonFeatureEditPanel.scss";

const GeoJsonEditPopUp = (props) => {
  const { feature, onDelete, onClose, onSave } = props;
  const [propertyFields, setPropertyFields] = useState(
    extractAndSortNonStyleProperties(feature)
  );
  const [styleFields, setStyleFields] = useState(
    extractStyleProperties(feature)
  );

  const previousFeatureId = useRef(feature.id);

  if (feature.id !== previousFeatureId.current) {
    setPropertyFields(extractAndSortNonStyleProperties(feature));
    setStyleFields(extractStyleProperties(feature));
    previousFeatureId.current = feature.id;
  }

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNewField, setShowNewField] = useState(false);
  const [errors, setErrors] = useState({});

  const handleStyleChange = useCallback(
    (index) => (newField) => {
      setStyleFields((oldFields) => {
        const newFields = [...oldFields];
        newFields[index] = newField;
        return newFields;
      });
    },
    [onSave]
  );

  const handlePropertyChange = useCallback(
    (index) => (newField) => {
      setPropertyFields((oldFields) => {
        const newFields = [...oldFields];
        newFields[index] = newField;
        return newFields;
      });
    },
    [setPropertyFields]
  );

  const handleAddField = useCallback(() => {
    setShowNewField(true);
  }, []);

  const handleDeleteField = useCallback(
    (index) => () => {
      setPropertyFields((oldFields) => {
        const updatedFields = [...oldFields];
        updatedFields.splice(index, 1);
        return updatedFields;
      });
      setErrors({});
    },

    [setPropertyFields]
  );

  const handleClose = useCallback(() => {
    onClose({ doRemoveFeatureState: true });
  }, [onClose]);

  const handleSave = useCallback(() => {
    const geoJSONSourceDiff = buildGeoJSONSourceDiff({
      oldProperties: feature.properties,
      propertyFields,
      styleFields,
    });
    onSave(geoJSONSourceDiff);
  }, [onSave, feature, propertyFields, styleFields]);

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

  const handleAddNewField = useCallback(
    (newField) => {
      setPropertyFields((prevFields) => [
        ...prevFields,
        [newField.key, newField.value],
      ]);
      setShowNewField(false);
    },
    [setPropertyFields]
  );

  return (
    <div className="geojson-feature-edit-panel-root vkf-geojson-feature-view-content full-height">
      <GeoJsonPanelHeader
        title={translate("geojson-editview-header-text")}
        onCloseClick={onClose}
      />
      <div className="properties-container">
        <div className="style-property-header">
          <p className="header-text geojson-feature-property-label">
            {translate("geojson-editfeature-style-header")}
          </p>
        </div>

        <div className="style-properties-container">
          {styleFields.map((entry, index) => {
            const [key, value] = entry;
            const { inputProps } = styleFieldSettings[key];
            return (
              <EditStyleField
                onChange={handleStyleChange(index)}
                onBlur={handleStyleChange(index)}
                key={`${key}-${feature.id}`}
                title={key}
                inputProps={inputProps}
                value={value}
                id={`${key}-${feature.id}`}
              />
            );
          })}
        </div>
        <div className="none-style-properties-container">
          {propertyFields.map((entry, index) => {
            const [key, value] = entry;
            const isPredefinedField = isDefined(predefinedFieldSettings[key]);
            const inputProps = predefinedFieldSettings[key]?.inputProps;

            return (
              <EditNonStyleField
                onBlur={handlePropertyChange(index)}
                key={`${key}-${feature.id}`}
                isHeaderEditable={!isPredefinedField}
                title={key}
                inputProps={inputProps}
                value={value}
                onDelete={
                  !isPredefinedField ? handleDeleteField(index) : undefined
                }
                existingFields={propertyFields}
                onError={setErrors}
                id={`${key}-${feature.id}`}
              />
            );
          })}
        </div>

        <div className="new-field-container">
          <div className={clsx("new-fields", showNewField && "in")}>
            <NewField
              existingFields={propertyFields}
              onAddField={handleAddNewField}
              onClose={() => {
                setShowNewField(false);
                setErrors({});
              }}
              isDisplayed={showNewField}
              onError={setErrors}
            />
          </div>

          <div
            className={clsx(
              "new-field-button-container",
              !showNewField && "in"
            )}
          >
            <CustomButton
              className="new-field-button"
              onClick={handleAddField}
              disabled={showNewField || errors.key || errors.value}
            >
              <VkfIcon name="add" />
              <p className="geojson-feature-property-label">
                {translate("geojson-editfeature-add-new-field-button")}
              </p>
            </CustomButton>
          </div>
        </div>
        <div className="danger-zone-container">
          <DangerZone
            title={translate("geojson-editfeature-danger-zone-title")}
            onDeleteClick={toggleDeleteDialog}
            buttonLabel={translate("geojson-featureview-delete-btn")}
          />
        </div>
      </div>
      <div className="footer-container">
        <CustomButton
          className="save-button"
          onClick={handleSave}
          type="save"
          disabled={errors.key || errors.value || showNewField}
        >
          <VkfIcon name="save" />
          {translate("geojson-featureview-save-btn")}
        </CustomButton>
        <CustomButton
          className="discard-button"
          onClick={handleClose}
          type="discard"
        >
          <VkfIcon name="discard" />
          {translate("geojson-featureview-cancel-btn")}
        </CustomButton>
      </div>
      {showDeleteDialog && (
        <DeleteDialog
          show={showDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
};

GeoJsonEditPopUp.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    geometry: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
  }).isRequired,
  onFeatureStateChange: PropTypes.func,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  onSave: PropTypes.func,
};

export default GeoJsonEditPopUp;
