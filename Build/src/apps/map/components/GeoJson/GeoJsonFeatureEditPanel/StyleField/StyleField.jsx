/**
 * Created by pouria.rezaei@pikobytes.de on 11/2/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";

import "./StyleField.scss";

const StyleField = forwardRef(function EditStyleField(
  { title, value, onChange, onBlur, id, ...props },
  ref
) {
  return (
    <div className="style-field-root">
      <div className="vkf-form-control">
        <label htmlFor={id} className="vkf-form-label">
          {title}
        </label>
        <input
          id={id}
          className="vkf-form-input"
          defaultValue={value}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          {...props}
        />
      </div>
    </div>
  );
});

StyleField.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.any,
  inputProps: PropTypes.object,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  id: PropTypes.string.isRequired,
};

export default StyleField;
