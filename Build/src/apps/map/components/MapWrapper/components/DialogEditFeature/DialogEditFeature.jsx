/**
 * Created by nicolas.looschen@pikobytes.de on 04.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Feature from "ol/Feature";
import { Button, Modal, Table } from "react-bootstrap";
import { useRecoilValue } from "recoil";

import DialogEditFeatureRow from "./DialogEditFeatureRow/DialogEditFeatureRow";
import {
  ignoredProperties,
  predefinedProperties,
  predefinedFieldSettings,
  styleFieldSettings,
} from "./settings";
import {
  checkForPredefinedProperty,
  checkForStylingProperty,
  filterCustomProperties,
  getNonUniqueRows,
} from "./util/util";
import { translate } from "../../../../../../util/util";
import { map3dState } from "../../../../atoms/atoms";

import "./DialogEditFeature.scss";

const ERROR_TYPES = {
  NON_UNIQUE_KEY: "non-unique-key",
  PREDEFINED_KEY_IN_CUSTOM_PROPERTIES: "predefined-key-in-custom-properties",
  STYLE_KEY_IN_CUSTOM_PROPERTIES: "style-key-in-custom-properties",
};

export const DialogEditFeature = ({ feature, onClose, onDelete }) => {
  // state
  const [errorRowIndices, setErrorRowIndices] = useState([]);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const is3dEnabled = useRecoilValue(map3dState);
  const [rows, setRows] = useState(filterCustomProperties(feature));
  const styles = feature.getStyle();

  // refs
  const isSavedRef = useRef(false);
  const originalStyleRef = useRef();

  ///
  // Handler section
  ///

  /**
   * Add row to table
   */
  const handleAddRow = () => {
    setRows((oldRows) => [...oldRows, ["", ""]]);
  };

  /**
   * Close the overlay
   */
  const handleClose = () => {
    onClose();
  };

  /**
   * Delete the selected feature
   */
  const handleDelete = () => {
    onDelete(feature);
  };

  /**
   * Change style of the feature
   * @param changeHandler
   * @return {(function(*): void)|*}
   */
  const handleStyleChange = (changeHandler) => (newValue) => {
    changeHandler(feature, newValue);
  };

  /**
   * Change non-style properties of the feature
   * @param index
   * @return {(function(*): void)|*}
   */
  const handlePropertyChange = (index) => (newRow) => {
    setRows((oldRows) => {
      const newRows = [...oldRows];
      newRows[index] = newRow;

      // check if keys are unique
      const nonUniqueRows = getNonUniqueRows(newRows);

      if (nonUniqueRows.length > 0) {
        setErrorMessage(ERROR_TYPES.NON_UNIQUE_KEY);
      }

      // check if styling keys are supplied in custom properties
      const stylingRows = newRows
        .map((row, index) => [row[0], index])
        .filter(([k]) =>
          checkForStylingProperty(k, feature.getGeometry().getType())
        )
        .map(([, i]) => i);

      if (stylingRows.length > 0) {
        setErrorMessage(ERROR_TYPES.STYLE_KEY_IN_CUSTOM_PROPERTIES);
      }

      // check if predefined properties are supplied in custom properties
      const predefinedRows = newRows
        .map((row, index) => [row[0], index])
        .filter(([k]) => checkForPredefinedProperty(k))
        .map(([, i]) => i);

      if (predefinedRows.length > 0) {
        setErrorMessage(ERROR_TYPES.PREDEFINED_KEY_IN_CUSTOM_PROPERTIES);
      }

      const newErrorRows = [...new Set(nonUniqueRows.concat(stylingRows))];

      // reset error message in case there are no erroneous rows
      if (newErrorRows.length === 0) {
        setErrorMessage(undefined);
      }

      setErrorRowIndices(newErrorRows);

      return newRows;
    });
  };

  /**
   * Write changes to the feature
   */
  const handleSave = () => {
    const oldProperties = feature.getProperties();
    const newProperties = {};

    rows.forEach(([k, v]) => {
      // only write rows with non empty key to feature
      if (k !== undefined && k !== "") {
        newProperties[k] = v;
      }
    });

    // Write stored values for ignored properties
    Object.entries(oldProperties)
      .filter(
        (entry) =>
          ignoredProperties.includes(entry[0]) ||
          predefinedProperties.includes(entry[0])
      )
      .forEach(([k, v]) => {
        newProperties[k] = v;
      });

    // reset feature properties
    Object.keys(oldProperties).forEach((propertyKey) =>
      feature.unset(propertyKey)
    );

    // write new Properties to feature
    feature.setProperties(Object.assign({}, newProperties));
    isSavedRef.current = true;
    onClose();
  };

  ///
  // Effect section
  ///

  // Store original styles of the feature
  useEffect(() => {
    isSavedRef.current = false;
    originalStyleRef.current = feature.getStyle().clone();

    // restore original styles if the edits were not saved
    return () => {
      if (!isSavedRef.current) {
        feature.setStyle(originalStyleRef.current);
      }
    };
  }, []);

  // update internal state on change of selected feature
  useEffect(() => {
    setRows(filterCustomProperties(feature));
  }, [feature]);

  return (
    <div className="vkf-feature-edit-dialog-root">
      <div className="feature-edit-dialog-header">
        <Modal.Header closeButton onHide={onClose}>
          <Modal.Title>
            {translate("geojson-editdialog-title")}{" "}
            {feature.get("title") ?? feature.getGeometry().getType()}
          </Modal.Title>
        </Modal.Header>
      </div>
      <div className="feature-edit-dialog-content">
        <Modal.Body>
          <div className="table-container">
            <Table bordered condensed>
              <tbody>
                {Object.keys(styleFieldSettings).map((sk) => {
                  const {
                    changeHandler,
                    geometryTypes,
                    valueExtractor,
                    ...settings
                  } = styleFieldSettings[sk];

                  return (
                    geometryTypes.includes(feature.getGeometry().getType()) && (
                      <DialogEditFeatureRow
                        debounceChanges={is3dEnabled}
                        onChange={handleStyleChange(changeHandler)}
                        key={`${sk}_${feature.ol_uid}`}
                        isHeaderEditable={false}
                        title={sk}
                        inputProps={settings}
                        value={
                          valueExtractor !== undefined
                            ? valueExtractor(styles)
                            : undefined
                        }
                      />
                    )
                  );
                })}

                {Object.keys(predefinedFieldSettings).map((pk) => {
                  const { changeHandler, ...settings } =
                    predefinedFieldSettings[pk];

                  return (
                    <DialogEditFeatureRow
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

                {rows.map((entry, index) => {
                  const [vk, value] = entry;

                  return (
                    <DialogEditFeatureRow
                      error={errorRowIndices.includes(index)}
                      onBlur={handlePropertyChange(index)}
                      key={index}
                      isHeaderEditable={true}
                      title={vk}
                      value={value}
                    />
                  );
                })}
              </tbody>
            </Table>
          </div>

          {errorMessage !== undefined && (
            <div className="error-message">
              {translate(`geojson-editdialog-${errorMessage}`)}
            </div>
          )}

          <Button bsStyle="link" onClick={handleAddRow}>
            +{translate("geojson-editdialog-add-row")}
          </Button>
        </Modal.Body>
      </div>
      <div className="feature-edit-dialog-footer">
        <Modal.Footer>
          <div className="footer-content">
            <div>
              <Button onClick={handleClose} bsStyle="warning">
                {translate("geojson-editdialog-cancel")}
              </Button>
              <Button bsStyle="primary" onClick={handleSave}>
                {translate("geojson-editdialog-save")}
              </Button>
            </div>
            <div>
              <Button onClick={handleDelete} bsStyle="danger">
                {translate("geojson-editdialog-delete")}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </div>
    </div>
  );
};

DialogEditFeature.propTypes = {
  feature: PropTypes.instanceOf(Feature),
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
};

export default DialogEditFeature;
