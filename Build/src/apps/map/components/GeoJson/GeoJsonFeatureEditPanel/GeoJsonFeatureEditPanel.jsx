/**
 * Created by pouria.rezaei@pikobytes.de on 10/22/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
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

  const doBlockComponentReset = useRef(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNewField, setShowNewField] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      if (doBlockComponentReset.current) {
        return;
      }
      handleClose();
    };
  }, []);

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
    doBlockComponentReset.current = true;
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
            const [styleProperty, value] = entry;
            const { inputProps } = styleFieldSettings[styleProperty];
            return (
              <EditStyleField
                onChange={handleStyleChange(index)}
                onBlur={handleStyleChange(index)}
                key={styleProperty}
                title={styleProperty}
                inputProps={inputProps}
                value={value}
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
                key={key}
                isHeaderEditable={!isPredefinedField}
                title={key}
                inputProps={inputProps}
                value={value}
                onDelete={
                  !isPredefinedField ? handleDeleteField(index) : undefined
                }
                existingFields={propertyFields}
                onError={setErrors}
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

        <div className="danger-zone">
          <p className="header-text geojson-feature-property-label">
            danger zone
          </p>

          <div className="delete-button-container">
            <p className="button-header-text">
              {translate("geojson-editfeature-danger-zone-title")}
            </p>

            <CustomButton
              className="delete-feature-button"
              onClick={toggleDeleteDialog}
              type="delete"
            >
              <VkfIcon name="delete" />
              <p className="delete-button-text geojson-feature-property-label">
                {translate("geojson-featureview-delete-btn")}
              </p>
            </CustomButton>
          </div>
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
