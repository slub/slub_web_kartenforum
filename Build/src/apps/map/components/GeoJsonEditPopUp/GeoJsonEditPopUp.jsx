/**
 * Created by pouria.rezaei@pikobytes.de on 13/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Button as BootstrapButton } from "react-bootstrap";
import PropTypes from "prop-types";

// Internal dependencies
import { translate } from "../../../../util/util.js";
import {
  predefinedFieldSettings,
  styleFieldSettings,
} from "../../views/GeoJsonView/settings.js";
import Button from "../Buttons/Button.jsx";
import DeleteDialog from "./components/DeleteDialog/DeleteDialog.jsx";
import { EditFields } from "./components/EditFields/EditFields.jsx";
import { filterPropertiesAndSort, saveFeatureChanges } from "./util/util.js";
import "./GeoJsonEditPopUp.scss";
import { mapState } from "../../atoms/atoms.js";
import { useRecoilValue } from "recoil";
import { isDefined } from "../../../../util/util.js";

const GeoJsonEditPopUp = (props) => {
  const { feature, onDelete, onClose, onSave } = props;
  const [fields, setFields] = useState(filterPropertiesAndSort(feature));
  // FIXME const [featureStyle, setFeatureStyle] = useState(feature.getStyle().clone());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const map = useRecoilValue(mapState);

  // TODO GEOJSON PORT - keep debounce functionality?
  const useDebounceChanges = useMemo(() => false);

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
    // FIXME feature.setStyle(featureStyle);
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
    // FIXME changeHandler(feature, newValue);
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
    saveFeatureChanges(map, feature, refFields, onSave);
    refBlockReset.current = true;
    handleClose();
  };

  // Effect section

  // update internal state on change of selected feature
  useEffect(() => {
    setFields(filterPropertiesAndSort(feature));
    // FIXME setFeatureStyle(feature.getStyle().clone());
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
              geometryTypes.includes(feature.geometry?.type) && (
                <EditFields
                  debounceChanges={useDebounceChanges}
                  onChange={handleStyleChange(changeHandler)}
                  key={`${sk}`}
                  isHeaderEditable={false}
                  title={sk}
                  inputProps={settings}
                  value={
                    valueExtractor !== undefined
                      ? undefined // FIXME valueExtractor(feature.getStyle())
                      : undefined
                  }
                />
              )
            );
          })}
        </div>

        <div className="none-style-property-container">
          {fields.map((entry, index) => {
            const [key, value] = entry;
            const isPredefinedField = isDefined(predefinedFieldSettings[key]);
            const { ...settings } = isPredefinedField
              ? predefinedFieldSettings[key]
              : undefined;

            return (
              <EditFields
                onBlur={handlePropertyChange(index)}
                key={index}
                isHeaderEditable={!isPredefinedField}
                title={key}
                inputProps={settings}
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
  feature: PropTypes.object,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  onSave: PropTypes.func,
};

export default GeoJsonEditPopUp;
