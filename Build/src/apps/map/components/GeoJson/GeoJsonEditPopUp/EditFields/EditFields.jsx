/**
 * Created by pouria.rezaei@pikobytes.de on 13/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { isDefined, translate } from "@util/util.js";
import ImageFallback from "../../ImageFallback";
import "./EditFields.scss";
import { parseColorStringToHexWithLegacy } from "../../util/colorUtil.js";
import {
  DEFAULT_STYLE_VALUES,
  GEOJSON_LAYER_TYPES,
} from "@map/components/CustomLayers/GeoJsonLayer/constants.js";

export const EditFields = (props) => {
  const {
    isHeaderEditable,
    onBlur,
    onChange,
    onDelete,
    title,
    inputProps = {},
    value,
  } = props;

  const [imageLink, setImageLink] = useState(title === "img_link" ? value : "");
  const headerInputRef = useRef();
  const valueInputRef = useRef();

  const useTextarea = useMemo(() => {
    return isDefined(value) && value.length > 30;
  }, [value]);

  const validate = useCallback(
    (value) => {
      const { type, min, max } = inputProps;
      let newValue = value;

      if (type === "number") {
        newValue = Number.parseFloat(newValue);
        newValue = Number.isNaN(newValue) ? 1 : newValue;

        if (isDefined(min)) {
          newValue = Math.max(min, newValue);
        }

        if (isDefined(max)) {
          newValue = Math.min(max, newValue);
        }
      } else if (type === "color") {
        try {
          newValue = parseColorStringToHexWithLegacy(newValue);
        } catch (error) {
          newValue = DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.SYMBOL].COLOR;
        }
      }

      return newValue;
    },
    [inputProps]
  );

  const validatedValue = useMemo(() => {
    return validate(value);
  }, [value, validate]);

  ///
  // Handler section
  ///
  const handleBlur = useCallback(
    (type) => (e) => {
      const title = headerInputRef.current.value;
      const value = validate(valueInputRef.current.value);

      e.target.value = value;
      if (type === "title") {
        e.target.value = title;
      }

      if (isDefined(onBlur)) {
        onBlur([title, value]);
      }

      if (title === "img_link") {
        setImageLink(value);
      }
    },
    [validate, onBlur, setImageLink]
  );

  const handleChange = useCallback(
    (e) => {
      if (isDefined(onChange)) {
        const value = validate(e.target.value);
        onChange([title, value]);
      }
    },
    [validate, onChange]
  );

  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  // TODO what does the empty useEffect do?
  useEffect(() => {}, [imageLink]);

  return (
    <div className="feature-edit-input-field">
      {imageLink && imageLink !== "broken" ? (
        <div className="img-container">
          <label className="body1" htmlFor="image">
            {translate("geojson-featureview-image-title")}
          </label>
          <img
            src={imageLink}
            className="image"
            id="image"
            onError={() => setImageLink("broken")}
          />
        </div>
      ) : null}
      {imageLink === "broken" && <ImageFallback />}

      <div className="input-field">
        <input
          className="editable-label body1"
          onBlur={isHeaderEditable ? handleBlur("title") : undefined}
          type="text"
          defaultValue={title}
          readOnly={!isHeaderEditable}
          ref={headerInputRef}
        />
        {isHeaderEditable && (
          <button className="btn btn-xs" onClick={handleDelete}>
            <span
              className="glyphicon glyphicon-minus"
              aria-hidden="true"
            ></span>
          </button>
        )}
      </div>

      {useTextarea ? (
        <textarea
          className="body2"
          {...inputProps}
          defaultValue={validatedValue}
          onChange={handleChange}
          onBlur={handleBlur("value")}
          ref={valueInputRef}
          rows={Math.ceil(validatedValue.length / 20)}
        />
      ) : (
        <input
          className="body2"
          {...inputProps}
          defaultValue={validatedValue}
          onChange={handleChange}
          onBlur={handleBlur("value")}
          ref={valueInputRef}
        />
      )}
    </div>
  );
};

EditFields.propTypes = {
  debounceChanges: PropTypes.bool,
  error: PropTypes.bool,
  inputProps: PropTypes.shape({
    max: PropTypes.number,
    min: PropTypes.number,
    step: PropTypes.number,
    type: PropTypes.string,
  }),
  isHeaderEditable: PropTypes.bool,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  value: PropTypes.any,
};

export default EditFields;
