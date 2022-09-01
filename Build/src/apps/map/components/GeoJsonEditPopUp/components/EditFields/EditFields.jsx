/**
 * Created by pouria.rezaei@pikobytes.de on 13/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { translate } from "../../../../../../util/util.js";
import MarkerPicker from "../MarkerPicker/MarkerPicker.jsx";
import ImageFallback from "../ImageFallback/ImageFallback.jsx";
import "./EditFields.scss";

export const EditFields = (props) => {
  const {
    debounceChanges,
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
  const timeoutRef = useRef();
  const valueInputRef = useRef();

  ///
  // Handler section
  ///

  //  Handle blur of inputs
  const handleBlur = (e) => {
    if (!e.target.readOnly) {
      const { type, min, max } = inputProps;
      let val = e.target.value;

      // Cap input value to range
      if (type === "number") {
        if (min !== undefined) {
          val = Math.max(min, val);
        }

        if (max !== undefined) {
          val = Math.min(max, val);
        }

        e.target.value = val;

        if (onChange !== undefined) {
          onChange(val);
        }
      }

      if (onBlur !== undefined) {
        onBlur([headerInputRef.current.value, valueInputRef.current.value]);
      }

      if (headerInputRef.current.value === "img_link") {
        setImageLink(valueInputRef.current.value);
      }
    }
  };

  // Propagate changes

  const handleChange = useCallback(
    (e) => {
      if (onChange !== undefined) {
        if (debounceChanges) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            onChange(e.target.value);
          }, 300);
        } else {
          onChange(e.target.value);
        }
      }
    },
    [debounceChanges]
  );

  const handleDelete = () => {
    onDelete();
  };

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
          onBlur={handleBlur}
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

      {inputProps.type === "marker" ? (
        <MarkerPicker onChange={onChange} src={value} />
      ) : value !== undefined && value.length > 30 ? (
        <textarea
          className="body2"
          {...inputProps}
          defaultValue={value}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={valueInputRef}
          rows={Math.ceil(value.length / 20)}
        />
      ) : (
        <input
          className="body2"
          {...inputProps}
          defaultValue={value}
          onChange={handleChange}
          onBlur={handleBlur}
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
