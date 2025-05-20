/*
 * Created by tom.schulze@pikobytes.de on 19.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import PropTypes from "prop-types";
import clsx from "clsx";
import React, { forwardRef } from "react";

import "./SelectField.scss";

const SelectField = forwardRef(function SelectField(props, ref) {
  const { options, ...rest } = props;
  const disabled = props.disabled;

  return (
    <div className="vkf-select-field-root">
      <div className={clsx("select-field-container", disabled && "disabled")}>
        <select {...rest} ref={ref}>
          {options.map((option) => {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
});

SelectField.propTypes = {
  className: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  defaultValue: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
};

export default SelectField;
