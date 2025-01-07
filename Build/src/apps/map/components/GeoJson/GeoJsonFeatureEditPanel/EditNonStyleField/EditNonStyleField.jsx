/**
 * Created by pouria.rezaei@pikobytes.de on 11/2/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

import { isDefined, translate } from "@util/util.js";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import DateInput from "@components/DateInput";
import ImageWithFallback from "@map/components/GeoJson/components/ImageWithFallback";

import { formatDateLocalized, parseDateLocalized } from "@util/date";
import { FEATURE_PROPERTIES } from "../../constants";

import "./EditNonStyleField.scss";

const EditNonStyleField = ({
  title,
  value,
  onChange,
  onBlur,
  onDelete,
  isHeaderEditable,
  existingFields,
  onError,
  id,
}) => {
  const [errors, setErrors] = useState({ key: false, value: false });
  const isImageField = useMemo(
    () => title === FEATURE_PROPERTIES.imgLink,
    [title]
  );

  const keyInputRef = useRef();
  const valueInputRef = useRef();

  const handleBlur = () => {
    const currentKey = keyInputRef.current.value;
    let currentValue = valueInputRef.current.value;
    let newErrors = { key: false, value: false };

    const isKeyChanged = currentKey !== title;
    const isValueEmpty = currentValue === "";
    const isKeyExists =
      isKeyChanged &&
      existingFields.some(
        ([existingKey]) =>
          existingKey.toLowerCase() === currentKey.toLowerCase()
      );

    const isTimeInputField = title === FEATURE_PROPERTIES.time;
    if (isTimeInputField) {
      if (currentValue !== "") {
        const parsedValue = parseDateLocalized(currentValue).valueOf();

        if (Number.isNaN(parsedValue)) {
          newErrors = { key: false, value: true };
        } else {
          currentValue = parsedValue;
        }
      }
    } else {
      newErrors = {
        key: isKeyExists || currentKey === "",
        value: isHeaderEditable && isValueEmpty,
      };
    }

    setErrors(newErrors);
    onError(newErrors);

    if (!newErrors.key && !newErrors.value) {
      onBlur([currentKey, currentValue]);
      setErrors({ key: false, value: false });
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const handleChange = useCallback(
    (e) => {
      if (isDefined(onChange)) {
        onChange(e.target.value);
      }
    },
    [onChange]
  );

  const handleDelete = useCallback(() => {
    if (isDefined(onDelete)) {
      onDelete();
    }
  }, [onDelete, errors]);

  return (
    <>
      {isImageField && (
        <div className="none-style-property-item">
          <input
            className="geojson-feature-property-label not-editable"
            defaultValue={translate("geojson-featureview-image-title")}
            type="text"
            tabIndex="-1"
            readOnly
          />
          <ImageWithFallback imageUrl={value} showPlaceholder imageAsPreview />
        </div>
      )}
      <div className="none-style-property-item">
        <input
          className={clsx(
            "geojson-feature-property-label",
            isHeaderEditable ? "editable" : "not-editable",
            { error: errors.key }
          )}
          onBlur={isHeaderEditable ? handleBlur : undefined}
          type="text"
          defaultValue={title}
          readOnly={!isHeaderEditable}
          tabIndex={isHeaderEditable ? 0 : -1}
          onKeyDown={isHeaderEditable ? handleKeyDown : undefined}
          ref={keyInputRef}
          placeholder={translate("geojson-editfeature-input-placeholder")}
          key={`header-${id}`}
        />
        {title !== FEATURE_PROPERTIES.time && (
          <input
            className={clsx("geojson-feature-property-input", {
              error: errors.value,
            })}
            defaultValue={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            ref={valueInputRef}
            placeholder={translate("geojson-editfeature-label-placeholder")}
            key={`value-${id}`}
          />
        )}
        {title === FEATURE_PROPERTIES.time && (
          <DateInput
            className={clsx("geojson-feature-property-input", {
              error: errors.value,
            })}
            value={value === "" ? "" : formatDateLocalized(new Date(value))}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            ref={valueInputRef}
            placeholder={translate(
              "geojson-editfeature-input-placeholder-date"
            )}
            key={`value-${id}`}
          />
        )}
        {isHeaderEditable && (
          <CustomButton
            className="delete-button"
            type="discard"
            onClick={handleDelete}
          >
            <p>{translate("geojson-featureview-delete-field-btn")}</p>
            <VkfIcon name="delete" />
          </CustomButton>
        )}
      </div>
    </>
  );
};

EditNonStyleField.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onDelete: PropTypes.func,
  isHeaderEditable: PropTypes.bool,
  existingFields: PropTypes.array,
  onError: PropTypes.func,
  id: PropTypes.string.isRequired,
};

export default EditNonStyleField;
