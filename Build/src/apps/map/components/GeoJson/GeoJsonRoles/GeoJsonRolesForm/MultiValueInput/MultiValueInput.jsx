/*
 * Created by tom.schulze@pikobytes.de on 12.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import PropTypes from "prop-types";
import React, { useCallback, useState, forwardRef } from "react";
import { isDefined } from "@util/util";
import VkfPill from "../VkfPill";

import "./MultiValueInput.scss";

const MultiValueInput = forwardRef(function MultiValueInput(props, ref) {
  const {
    name,
    onChange = () => {},
    onBlur = () => {},
    value = [],
    readOnly = false,
  } = props;

  const [internalValues, setInternalValues] = useState(value ?? []);

  const handleRemove = useCallback(
    (index) => {
      if (!isDefined(index)) {
        return;
      }

      const newValues = [...internalValues];
      newValues.splice(index, 1);
      setInternalValues(newValues);
      onChange(newValues);
    },
    [internalValues]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key !== "Enter") {
        return;
      }

      const val = event.target.value ?? "";

      if (val === "") {
        return;
      }

      const isDuplicate =
        internalValues.findIndex((value) => value === val) > -1;

      if (isDuplicate) {
        return;
      }

      event.target.value = "";

      const newValues = [...internalValues, val];
      setInternalValues(newValues);
      onChange(newValues);
    },
    [internalValues]
  );

  return (
    <div className="multi-value-input-root">
      <div className="input-field">
        {internalValues.map((value, idx) => (
          <VkfPill
            key={value}
            value={value}
            onDeleteClick={() => handleRemove(idx)}
            disabled={readOnly}
          />
        ))}
        <input
          ref={ref}
          name={name}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
});

MultiValueInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.array,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
};

export default MultiValueInput;
