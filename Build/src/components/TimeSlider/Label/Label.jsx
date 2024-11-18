/*
 * Created by tom.schulze@pikobytes.de on 06.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import PropTypes from "prop-types";
import React, { forwardRef, useMemo } from "react";

import { formatDateLocalized } from "@util/date";

const Label = forwardRef(function renderLabel(
  { className, posX, shouldUseDate, value },
  ref
) {
  const formattedValue = useMemo(() => {
    if (Array.isArray(value)) {
      return shouldUseDate
        ? `${formatDateLocalized(value[0] * 1000)} - ${formatDateLocalized(
            value[1] * 1000
          )}`
        : `${value[0]} - ${value[1]}`;
    }

    return shouldUseDate ? formatDateLocalized(value * 1000) : value;
  }, [value]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: `translate(${posX}px)` }}
    >
      {formattedValue}
    </div>
  );
});

Label.propTypes = {
  className: PropTypes.string,
  posX: PropTypes.number.isRequired,
  shouldUseDate: PropTypes.bool.isRequired,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.number]).isRequired,
};

export default Label;
