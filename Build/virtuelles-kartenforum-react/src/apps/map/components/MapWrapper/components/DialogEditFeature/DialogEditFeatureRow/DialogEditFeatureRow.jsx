/**
 * Created by nicolas.looschen@pikobytes.de on 04.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

import "./DialogEditFeatureRow.scss";

export const DialogEditFeatureRow = ({
  error,
  onBlur,
  onChange,
  isHeaderEditable,
  title,
  inputProps = {},
  value,
}) => {
  const headerInputRef = useRef();
  const valueInputRef = useRef();

  ///
  // Handler section
  ///

  /**
   * Handle blur of inputs
   */
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
    }
  };

  /**
   * Propagate changes
   * @param e
   */
  const handleChange = (e) => {
    if (onChange !== undefined) {
      onChange(e.target.value);
    }
  };

  return (
    <tr className="vkf-feature-edit-dialog-row">
      <th className={clsx(error && "error")}>
        <input
          onBlur={handleBlur}
          type="text"
          defaultValue={title}
          readOnly={!isHeaderEditable}
          ref={headerInputRef}
        />
      </th>
      <td className={clsx(error && "error")}>
        <input
          {...inputProps}
          defaultValue={value}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={valueInputRef}
        />
      </td>
    </tr>
  );
};

DialogEditFeatureRow.propTypes = {
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
  title: PropTypes.string,
  value: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
};

export default DialogEditFeatureRow;
