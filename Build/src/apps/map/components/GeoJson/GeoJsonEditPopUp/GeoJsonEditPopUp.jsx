/**
 * Created by pouria.rezaei@pikobytes.de on 13/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button as BootstrapButton } from "react-bootstrap";
import PropTypes from "prop-types";

import { translate, isDefined } from "../../../../../util/util.js";
import { predefinedFieldSettings, styleFieldSettings } from "../constants.js";
import Button from "../../Buttons/Button.jsx";
import DeleteDialog from "./components/DeleteDialog/DeleteDialog.jsx";
import { EditFields } from "./components/EditFields/EditFields.jsx";
import {
  extractAndSortNonStyleProperties,
  extractStyleProperties,
  buildGeoJSONSourceDiff,
} from "../util/util.js";
import "./GeoJsonEditPopUp.scss";

const GeoJsonEditPopUp = (props) => {
  const { feature, onFeatureStateChange, onDelete, onClose, onSave } = props;
  const [propertyFields, setPropertyFields] = useState(
    extractAndSortNonStyleProperties(feature)
  );
  const [styleFields, setStyleFields] = useState(
    extractStyleProperties(feature)
  );

  const doBlockComponentReset = useRef(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // handle logic when component unmounts, e.g., when clicking outside the popup
  useEffect(() => {
    return () => {
      if (doBlockComponentReset.current) {
        return;
      }

      handleClose();
    };
  }, []);

  const handleStyleChange = useCallback(
    (styleProperty, index) => (newField) => {
      const [title, value] = newField;

      setStyleFields((oldFields) => {
        const newFields = [...oldFields];
        newFields[index] = [title, value];

        return newFields;
      });

      onFeatureStateChange({ [styleProperty]: value });
    },
    [setStyleFields, onFeatureStateChange]
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
    setPropertyFields((oldFields) => {
      const labelCount = oldFields.filter(([key]) =>
        key.startsWith("label-")
      ).length;
      const newLabel = `label-${labelCount + 1}`;
      return [...oldFields, [newLabel, ""]];
    });
  }, [setPropertyFields]);

  const handleDeleteField = useCallback(
    (index) => () => {
      setPropertyFields((oldFields) => {
        const updatedFields = [...oldFields];
        updatedFields.splice(index, 1);

        return updatedFields;
      });
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

  const handleShowDeleteDialog = useCallback(() => {
    setShowDeleteDialog(true);
  }, [setShowDeleteDialog]);

  const handleCloseDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
  }, [setShowDeleteDialog]);

  const handleConfirmDeleteDialog = useCallback(() => {
    onDelete(feature);
    setShowDeleteDialog(false);
  }, [onDelete, setShowDeleteDialog]);

  return (
    <div className="feature-edit-field">
      <div className="header">
        <p className="body1">{translate("geojson-featureview-header")}</p>
      </div>
      <div className="property-container">
        <div className="style-property-container">
          {styleFields.map((entry, index) => {
            const [styleProperty, value] = entry;
            const { inputProps } = styleFieldSettings[styleProperty];

            return (
              <EditFields
                onChange={handleStyleChange(styleProperty, index)}
                onBlur={handleStyleChange(styleProperty, index)}
                key={styleProperty}
                isHeaderEditable={false}
                title={styleProperty}
                inputProps={inputProps}
                value={value}
              />
            );
          })}
        </div>

        <div className="none-style-property-container">
          {propertyFields.map((entry, index) => {
            const [key, value] = entry;
            const isPredefinedField = isDefined(predefinedFieldSettings[key]);
            const inputProps = predefinedFieldSettings[key]?.inputProps;

            return (
              <EditFields
                onBlur={handlePropertyChange(index)}
                key={key}
                isHeaderEditable={!isPredefinedField}
                title={key}
                inputProps={inputProps}
                value={value}
                onDelete={
                  !isPredefinedField ? handleDeleteField(index) : undefined
                }
              />
            );
          })}
        </div>
        <div className="add-new-field-btn">
          <button className="btn btn-xs" onClick={handleAddField}>
            <span
              className="glyphicon glyphicon-plus"
              aria-hidden="true"
            ></span>
          </button>
        </div>
      </div>

      <div className="footer-container">
        <div>
          <Button className="cancel-btn" onClick={handleClose} type="default">
            {translate("geojson-featureview-cancel-btn")}
          </Button>
          <Button className="save-btn" onClick={handleSave} type="primary">
            {translate("geojson-featureview-save-btn")}
          </Button>
        </div>
        <BootstrapButton
          className="delete-btn"
          onClick={handleShowDeleteDialog}
        >
          {translate("geojson-featureview-delete-btn")}
        </BootstrapButton>
      </div>

      {showDeleteDialog && (
        <DeleteDialog
          show={showDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onDelete={handleConfirmDeleteDialog}
        />
      )}
    </div>
  );
};

GeoJsonEditPopUp.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.number.isRequired,
    geometry: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
  }).isRequired,
  onFeatureStateChange: PropTypes.func,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  onSave: PropTypes.func,
};

export default GeoJsonEditPopUp;
