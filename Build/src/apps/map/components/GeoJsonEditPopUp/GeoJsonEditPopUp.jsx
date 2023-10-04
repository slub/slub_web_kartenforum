/**
 * Created by pouria.rezaei@pikobytes.de on 13/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef, useState } from "react";
import { Button as BootstrapButton } from "react-bootstrap";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import Feature from "ol/Feature.js";

// Internal dependencies
import { translate } from "../../../../util/util.js";
import { map3dState } from "../../atoms/atoms.js";
import {
  predefinedFieldSettings,
  styleFieldSettings,
} from "../../views/GeoJsonView/settings.js";
import Button from "../Buttons/Button.jsx";
import DeleteDialog from "./components/DeleteDialog/DeleteDialog.jsx";
import { EditFields } from "./components/EditFields/EditFields.jsx";
import { filterCustomProperties, saveFeatureChanges } from "./util/util.js";
import "./GeoJsonEditPopUp.scss";

const GeoJsonEditPopUp = (props) => {
  const { feature, onDelete, onClose } = props;
  const is3dEnabled = useRecoilValue(map3dState);
  const [fields, setFields] = useState(filterCustomProperties(feature));
  const [featureStyle, setFeatureStyle] = useState(feature.getStyle().clone());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // refs
  const refFields = useRef(fields);
  const refBlockReset = useRef(false);

  // Effect section

  // Add new Field to the selected feature
  const handleAddField = () => {
    setFields((oldFields) => [...oldFields, ["label", ""]]);
  };

  // Close the overlay
  const handleClose = () => {
    onClose();
  };

  // Reset feature styles and close overlay
  const handleCancel = () => {
    feature.setStyle(featureStyle);
    handleClose();
  };

  // Show delete Modal dialog
  const handleShowDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  //Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
  };

  //Close Modal dialog and delete the selected feature
  const handleConfirmDeleteDialog = () => {
    onDelete(feature);
    setShowDeleteDialog(false);
  };

  // Change style of the feature
  const handleStyleChange = (changeHandler) => (newValue) => {
    changeHandler(feature, newValue);
  };

  //Change non-style properties of the feature
  const handlePropertyChange = (index) => (newField) => {
    setFields((oldFields) => {
      const newFields = [...oldFields];
      newFields[index] = newField;

      return newFields;
    });
  };

  //Delete field from feature
  const handleDeleteField = (index) => () => {
    setFields((oldFields) => {
      const updatedFields = [...oldFields];
      updatedFields.splice(index, 1);

      return updatedFields;
    });
  };

  // Write changes to the feature
  const handleSave = () => {
    saveFeatureChanges(feature, refFields);
    refBlockReset.current = true;
    handleClose();
  };

  // Effect section

  // update internal state on change of selected feature
  useEffect(() => {
    setFields(filterCustomProperties(feature));
    setFeatureStyle(feature.getStyle().clone());
  }, [feature]);

  useEffect(() => {
    refFields.current = fields;
  }, [fields]);

  // Use this effect for calling on unmount
  useEffect(() => {
    return () => {
      if (refBlockReset.current) {
        return;
      }
      handleCancel();
    };
  }, []);

  return (
    <div className="feature-edit-field">
      <div className="header">
        <p className="body1">{translate("geojson-featureview-header")}</p>
      </div>
      <div className="property-container">
        <div className="style-property-container">
          {Object.keys(styleFieldSettings).map((sk) => {
            const {
              changeHandler,
              geometryTypes,
              valueExtractor,
              ...settings
            } = styleFieldSettings[sk];

            return (
              geometryTypes.includes(feature.getGeometry().getType()) && (
                <EditFields
                  debounceChanges={is3dEnabled}
                  onChange={handleStyleChange(changeHandler)}
                  key={`${sk}_${feature.ol_uid}`}
                  isHeaderEditable={false}
                  title={sk}
                  inputProps={settings}
                  value={
                    valueExtractor !== undefined
                      ? valueExtractor(feature.getStyle())
                      : undefined
                  }
                />
              )
            );
          })}
        </div>

        <div className="none-style-property-container">
          {Object.keys(predefinedFieldSettings).map((pk) => {
            const { changeHandler, ...settings } = predefinedFieldSettings[pk];

            return (
              <EditFields
                debounceChanges={is3dEnabled}
                onChange={handleStyleChange(changeHandler)}
                key={`${pk}_${feature.ol_uid}`}
                isHeaderEditable={false}
                title={pk}
                inputProps={settings}
                value={feature.get(pk)}
              />
            );
          })}
          {fields.map((entry, index) => {
            const [vk, value] = entry;

            return (
              <EditFields
                onBlur={handlePropertyChange(index)}
                key={index}
                isHeaderEditable={true}
                title={vk}
                value={value}
                onDelete={handleDeleteField(index)}
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
          <Button className="cancel-btn" onClick={handleCancel} type="default">
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
  feature: PropTypes.instanceOf(Feature),
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
};

export default GeoJsonEditPopUp;
