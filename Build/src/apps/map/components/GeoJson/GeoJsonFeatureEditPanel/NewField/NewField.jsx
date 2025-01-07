/**
 * Created by pouria.rezaei@pikobytes.de on 10/22/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import "./NewField.scss";
import { translate } from "@util/util";
import VkfIcon from "@components/VkfIcon";
import clsx from "clsx";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import { validatePropertyField } from "@map/components/GeoJson/util/util";

const NewField = ({
  existingFields,
  onAddField,
  onClose,
  isDisplayed,
  onError,
}) => {
  const [newField, setNewField] = useState({ key: "", value: "" });
  const [errors, setErrors] = useState({ key: false, value: false });
  const refDeleteButton = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewField((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = useCallback(
    (e) => {
      if (e.relatedTarget === refDeleteButton.current) {
        return;
      }
      const { key, value } = newField;
      const { isValid, errors: validationErrors } = validatePropertyField(
        key,
        value,
        existingFields
      );

      setErrors(validationErrors);
      onError(validationErrors);

      if (isValid) {
        onAddField({
          key: key.trim().toLowerCase(),
          value: value.trim().toLowerCase(),
        });
        setNewField({ key: "", value: "" });
      }
    },
    [newField, existingFields, onAddField]
  );

  const handleClose = () => {
    onClose();
    setNewField({ key: "", value: "" });
    setErrors({ key: false, value: false });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  // Use callback ref with conditional focus based on isDisplayed
  const inputFocusRef = useCallback(
    (inputElement) => {
      if (inputElement && isDisplayed) {
        inputElement.focus();
      }
    },
    [isDisplayed]
  );
  return (
    <div className="new-field-root">
      <div className="label-section">
        <input
          className={clsx("geojson-feature-property-label", {
            error: errors.key,
          })}
          type="text"
          name="key"
          value={newField.key}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            setErrors((prevErrors) => ({ key: false, value: prevErrors.value }))
          }
          ref={inputFocusRef}
          placeholder={translate("geojson-editfeature-input-placeholder")}
        />
      </div>
      <div className="input-section">
        <input
          className={clsx("geojson-feature-property-input", {
            error: errors.value,
          })}
          type="text"
          name="value"
          value={newField.value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            setErrors((prevErrors) => ({ key: prevErrors.key, value: false }))
          }
          tabIndex={isDisplayed ? 0 : -1}
          placeholder={translate("geojson-editfeature-label-placeholder")}
        />
      </div>
      <CustomButton
        className="delete-button"
        type="discard"
        onClick={handleClose}
        ref={refDeleteButton}
      >
        <span>{translate("geojson-featureview-delete-field-btn")}</span>
        <VkfIcon name="delete" />
      </CustomButton>
    </div>
  );
};

NewField.propTypes = {
  existingFields: PropTypes.array.isRequired,
  onAddField: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isDisplayed: PropTypes.bool,
  onError: PropTypes.func,
};

export default NewField;
