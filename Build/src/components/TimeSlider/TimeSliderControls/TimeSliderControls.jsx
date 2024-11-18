/*
 * Created by tom.schulze@pikobytes.de on 28.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */
import clsx from "clsx";
import PropTypes from "prop-types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import DateInput from "@components/DateInput";
import VkfIcon from "@components/VkfIcon";
import {
  formatDateLocalized,
  isValidDate,
  parseDateLocalized,
} from "@util/date";

import "./TimeSliderControls.scss";

const TimesliderControls = ({ values, min, max, onChange }) => {
  const [internalValues, setInternalValues] = useState(values);

  const [isEditable, setIsEditable] = useState(false);

  // used to force re-rendering of date inputs when resetting to old values on error
  const [lastUpdatedStart, setLastUpdatedStart] = useState(0);
  const [lastUpdatedEnd, setLastUpdatedEnd] = useState(1);

  const refDateInputStart = useRef();
  const refDateInputEnd = useRef();
  const refEditButton = useRef();

  const { start, end } = useMemo(() => {
    return {
      start: formatDateLocalized(internalValues[0] * 1000),
      end: formatDateLocalized(internalValues[1] * 1000),
    };
  }, [internalValues]);

  const handleBlurStart = useCallback(
    (event, value) => {
      const start = parseDateLocalized(value).valueOf() / 1000;
      const end = internalValues[1];

      if (
        event.relatedTarget !== refDateInputEnd.current &&
        event.relatedTarget !== refEditButton.current
      ) {
        setIsEditable(false);
      }

      if (!isValidDate(start) || start > end || start < min) {
        onChange([internalValues[0], internalValues[1]]);
        setLastUpdatedStart(Date.now());
        return;
      }

      onChange([start, end]);
    },
    [internalValues]
  );

  const handleBlurEnd = useCallback(
    (event, value) => {
      const start = internalValues[0];
      const end = parseDateLocalized(value).valueOf() / 1000;

      if (
        event.relatedTarget !== refDateInputStart.current &&
        event.relatedTarget !== refEditButton.current
      ) {
        setIsEditable(false);
      }

      if (!isValidDate(end) || start > end || end > max) {
        onChange([internalValues[0], internalValues[1]]);
        setLastUpdatedEnd(Date.now());
        return;
      }

      onChange([start, end]);
    },
    [internalValues]
  );

  const handleKeyDown = useCallback((event) => {
    if (event.key !== "Enter") {
      return;
    }

    if (event.target === refDateInputStart.current) {
      refDateInputEnd.current.focus();
    }

    if (event.target === refDateInputEnd.current) {
      event.target.blur();
      setIsEditable(false);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isEditable) {
      refDateInputStart.current.focus();
    }
    setIsEditable((oldIsEditable) => !oldIsEditable);
  }, []);

  useEffect(() => {
    setInternalValues(values);
  }, [values]);

  return (
    <div className="timeslider-controls-root">
      <DateInput
        ref={refDateInputStart}
        key={lastUpdatedStart}
        value={start}
        onBlur={handleBlurStart}
        onKeyDown={handleKeyDown}
        readOnly={!isEditable}
        tabIndex={!isEditable ? -1 : undefined}
      />
      <span>–</span>
      <DateInput
        ref={refDateInputEnd}
        key={lastUpdatedEnd}
        value={end}
        onBlur={handleBlurEnd}
        onKeyDown={handleKeyDown}
        readOnly={!isEditable}
        tabIndex={!isEditable ? -1 : undefined}
      />
      <button
        ref={refEditButton}
        className={clsx("edit-button", isEditable && "edit-state")}
        onClick={handleClick}
      >
        <VkfIcon name="edit-inverse" />
      </button>
    </div>
  );
};

TimesliderControls.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TimesliderControls;
