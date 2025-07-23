import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

import { translate } from "@util/util";
import { Controller, useFormContext } from "react-hook-form";
import { parseDateLocalized, isValidLocalizedDate } from "@util/date";
import DateInput from "@components/DateInput";

import "./TimePeriodField.scss";

const isStartDateLessOrEqualThanEndDate = (start, end) => {
  const startDate = parseDateLocalized(start);
  const endDate = parseDateLocalized(end);

  return startDate <= endDate;
};

const TimePeriodField = ({
  startFieldName,
  endFieldName,
  showLabels = true,
  required = true,
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
              required,
              validate: (startDate, { [endFieldName]: endDate }) => {
                const isValid =
                  isValidLocalizedDate(startDate) &&
                  isStartDateLessOrEqualThanEndDate(startDate, endDate);
                if (required) {
                  return isValid;
                }

                return startDate === "" || isValid;
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
              required,
              validate: (endDate, { [startFieldName]: startDate }) => {
                const isValid =
                  isValidLocalizedDate(endDate) &&
                  isStartDateLessOrEqualThanEndDate(startDate, endDate);
                if (required) {
                  return isValid;
                }

                return endDate === "" || isValid;
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
};

export default TimePeriodField;
