import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

import { isDefined, translate } from "@util/util";
import { Controller, useFormContext } from "react-hook-form";
import {
  parseDateLocalized,
  isValidLocalizedDate,
  isDateInFuture,
} from "@util/date";
import DateInput from "@components/DateInput";

import "./TimePeriodField.scss";

const isStartDateLessOrEqualThanEndDate = (start, end) => {
  const startDate = parseDateLocalized(start);
  const endDate = parseDateLocalized(end);

  return startDate <= endDate;
};

const isEmptyDate = (date) => !isDefined(date) || date === "";

// A set date must be valid and if both dates are set and valid,
// the start must not be after the end.
// Unless opted out, the date must not be in the future
const validateSetTimePeriodDate = (
  date,
  otherDate,
  isStart,
  skipFutureValidation
) => {
  if (!isValidLocalizedDate(date)) {
    return false;
  }

  if (!skipFutureValidation && isDateInFuture(parseDateLocalized(date))) {
    return false;
  }

  if (isEmptyDate(otherDate) || !isValidLocalizedDate(otherDate)) {
    return true;
  }

  return isStart
    ? isStartDateLessOrEqualThanEndDate(date, otherDate)
    : isStartDateLessOrEqualThanEndDate(otherDate, date);
};

// A required time period may be open on one side, but not on both.
const validateRequiredTimePeriodDate = (
  date,
  otherDate,
  isStart,
  skipFutureValidation
) => {
  if (isEmptyDate(date)) {
    return !isEmptyDate(otherDate);
  }

  return validateSetTimePeriodDate(
    date,
    otherDate,
    isStart,
    skipFutureValidation
  );
};

// An optional time period may be empty or open on one side.
const validateOptionalTimePeriodDate = (
  date,
  otherDate,
  isStart,
  skipFutureValidation
) => {
  if (isEmptyDate(date)) {
    return true;
  }

  return validateSetTimePeriodDate(
    date,
    otherDate,
    isStart,
    skipFutureValidation
  );
};

const TimePeriodField = ({
  startFieldName,
  endFieldName,
  showLabels = true,
  required = true,
  skipFutureValidation = false,
}) => {
  const {
    trigger,
    control,
    formState: { errors },
  } = useFormContext();

  const handleStartDateChange = useCallback((val, { field, formState }) => {
    field.onChange(val);
    if (formState.errors[endFieldName]) {
      trigger(endFieldName);
    }
  }, []);

  const handleEndDateChange = useCallback((val, { field, formState }) => {
    field.onChange(val);
    if (formState.errors[startFieldName]) {
      trigger(startFieldName);
    }
  }, []);

  return (
    <div className="time-period-field-root">
      <div className="time-period-field-container">
        <div
          className={clsx(
            "vkf-form-control",
            errors[startFieldName] && "error"
          )}
        >
          {showLabels && (
            <label className="vkf-form-label" htmlFor={startFieldName}>
              {translate("geojson-label-timePeriod-start")}
            </label>
          )}

          <Controller
            control={control}
            name={startFieldName}
            render={({ field, formState }) => (
              <DateInput
                {...field}
                onChange={(val) =>
                  handleStartDateChange(val, { field, formState })
                }
                className="vkf-form-input"
                placeholder={translate(
                  "geojson-editfeature-input-placeholder-date"
                )}
              />
            )}
            rules={{
              validate: (startDate, { [endFieldName]: endDate }) => {
                if (required) {
                  return validateRequiredTimePeriodDate(
                    startDate,
                    endDate,
                    true,
                    skipFutureValidation
                  );
                }

                return validateOptionalTimePeriodDate(
                  startDate,
                  endDate,
                  true,
                  skipFutureValidation
                );
              },
            }}
          />
        </div>
        <div
          className={clsx("vkf-form-control", errors[endFieldName] && "error")}
        >
          {showLabels && (
            <label className="vkf-form-label" htmlFor={endFieldName}>
              {translate("geojson-label-timePeriod-end")}
            </label>
          )}

          <Controller
            control={control}
            name={endFieldName}
            render={({ field, formState }) => (
              <DateInput
                {...field}
                onChange={(val) =>
                  handleEndDateChange(val, { field, formState })
                }
                className="vkf-form-input"
                placeholder={translate(
                  "geojson-editfeature-input-placeholder-date"
                )}
              />
            )}
            rules={{
              validate: (endDate, { [startFieldName]: startDate }) => {
                if (required) {
                  return validateRequiredTimePeriodDate(
                    endDate,
                    startDate,
                    false,
                    skipFutureValidation
                  );
                }

                return validateOptionalTimePeriodDate(
                  endDate,
                  startDate,
                  false,
                  skipFutureValidation
                );
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

TimePeriodField.propTypes = {
  startFieldName: PropTypes.string.isRequired,
  endFieldName: PropTypes.string.isRequired,
  showLabels: PropTypes.bool,
  required: PropTypes.bool,
  skipFutureValidation: PropTypes.bool,
};

export default TimePeriodField;
