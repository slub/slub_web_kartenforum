/*
 * Created by tom.schulze@pikobytes.de on 28.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import clsx from "clsx";
import PropTypes from "prop-types";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import SettingsProvider, { LANGUAGE_CODE } from "@settings-provider";

import "./DateInput.scss";

function containsInvalidChars(str, dateSep) {
  function isDigit(char) {
    return char >= "0" && char <= "9";
  }

  return str.split("").some((c) => !isDigit(c) && c !== dateSep);
}

const DateInput = forwardRef(function DateInput(
  {
    className,
    value,
    onBlur = () => {},
    onKeyDown = () => {},
    onChange = () => {},
    readOnly,
    tabIndex,
    placeholder,
    name,
  },
  forwardedRef
) {
  const [internalValue, setInternalValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);

  if (previousValue !== value) {
    setPreviousValue(value);
    setInternalValue(value);
  }

  const dateSeparator = useMemo(() => {
    const langCode = SettingsProvider.getSettings().LANGUAGE_CODE;
    if (langCode === LANGUAGE_CODE.DE) {
      return ".";
    }

    return "/";
  }, []);

  const handleChange = useCallback(
    (event) => {
      const coercedValue = `${event.target.value}`;

      if (
        containsInvalidChars(coercedValue, dateSeparator) ||
        coercedValue.length > 10
      ) {
        return;
      }

      setInternalValue(event.target.value);
      onChange(event.target.value);
    },
    [dateSeparator]
  );

  const handleBlur = useCallback(
    (event) => {
      onBlur(event, internalValue);
    },
    [internalValue, onBlur]
  );

  return (
    <div className="date-input-root">
      <input
        className={clsx(readOnly && "readonly", className)}
        ref={forwardedRef}
        value={internalValue}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        onChange={handleChange}
        readOnly={readOnly ?? undefined}
        tabIndex={tabIndex ?? undefined}
        placeholder={placeholder ?? undefined}
        name={name ?? undefined}
      />
    </div>
  );
});

DateInput.propTypes = {
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  tabIndex: PropTypes.number,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  name: PropTypes.string,
};

export default DateInput;
