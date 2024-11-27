/**
 * Created by pouria.rezaei@pikobytes.de on 11/2/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

import { isDefined, translate } from "@util/util.js";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import DateInput from "@components/DateInput";
import ImageFallback from "../../components/ImageFallback";
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
  const [imageLink, setImageLink] = useState(
    title === FEATURE_PROPERTIES.imgLink ? value : ""
  );

  const previousId = useRef(id);

  if (previousId.current !== id) {
    title === FEATURE_PROPERTIES.imgLink
      ? setImageLink(value)
      : setImageLink("");
    previousId.current = id;
  }

  const [errors, setErrors] = useState({ key: false, value: false });

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
      if (currentKey === FEATURE_PROPERTIES.imgLink) {
        setImageLink(currentValue);
      }
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
    <div className="none-style-property-item">
      {imageLink && imageLink !== "broken" ? (
        <div className="img-container">
          <label className="geojson-feature-property-label" htmlFor="image">
            {translate("geojson-featureview-image-title")}
          </label>
          <img
            key={id}
            src={imageLink}
            className="image"
            id="image"
            onError={() => setImageLink("broken")}
          />
        </div>
      ) : null}
      {imageLink === "broken" && <ImageFallback />}

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
          placeholder={translate("geojson-editfeature-input-placeholder-date")}
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
