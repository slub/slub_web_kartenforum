/**
 * Created by pouria.rezaei@pikobytes.de on 11/2/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { isDefined } from "@util/util";
import { parseColorStringToHexWithLegacy } from "@map/components/GeoJson/util/colorUtil";
import {
  DEFAULT_STYLE_VALUES,
  GEOJSON_LAYER_TYPES,
} from "@map/components/CustomLayers/GeoJsonLayer/constants";

import "./EditStyleField.scss";

const EditStyleField = ({
  title,
  value,
  inputProps = {},
  onChange,
  onBlur,
}) => {
  const valueInputRef = useRef();

  const validateStyleValue = useCallback(
    (inputValue) => {
      const { type, min, max } = inputProps;
      let newValue = inputValue;

      if (type === "number") {
        newValue = Number.isNaN(Number.parseFloat(newValue))
          ? 1
          : parseFloat(newValue);
        newValue = isDefined(min) ? Math.max(min, newValue) : newValue;
        newValue = isDefined(max) ? Math.min(max, newValue) : newValue;
      } else if (type === "color") {
        try {
          newValue = parseColorStringToHexWithLegacy(newValue);
        } catch {
          newValue = DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.SYMBOL].COLOR;
        }
      }
      return newValue;
    },
    [inputProps]
  );

  const validatedStyleValue = useMemo(
    () => validateStyleValue(value),
    [value, validateStyleValue]
  );

  const handleBlur = useCallback(() => {
    const currentValue = validateStyleValue(valueInputRef.current.value);
    onBlur([title, currentValue]);
  }, [onBlur, validateStyleValue]);

  const handleChange = useCallback(
    (e) => {
      if (isDefined(onChange)) {
        const newValue = validateStyleValue(e.target.value);
        onChange([title, newValue]);
      }
    },
    [validateStyleValue, onChange]
  );

  return (
    <div className="style-property-item">
      <label htmlFor="style-input" className="geojson-feature-property-input">
        {title}
      </label>
      <input
        className="geojson-feature-property-input"
        {...inputProps}
        defaultValue={validatedStyleValue}
        onChange={handleChange}
        onBlur={handleBlur}
        ref={valueInputRef}
      />
    </div>
  );
};

EditStyleField.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.any,
  inputProps: PropTypes.object,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
};

export default EditStyleField;
