/*
 * Created by tom.schulze@pikobytes.de on 16.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";
import clsx from "clsx";
import {
  TIME_PERIOD_START_FIELD_NAME,
  TIME_PERIOD_END_FIELD_NAME,
} from "./util";
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

const TimePeriodField = () => {
  const {
    trigger,
    control,
    formState: { errors },
  } = useFormContext();

  const handleStartDateChange = useCallback((val, { field, formState }) => {
    field.onChange(val);
    if (formState.errors[TIME_PERIOD_END_FIELD_NAME]) {
      trigger(TIME_PERIOD_END_FIELD_NAME);
    }
  }, []);

  const handleEndDateChange = useCallback((val, { field, formState }) => {
    field.onChange(val);
    if (formState.errors[TIME_PERIOD_START_FIELD_NAME]) {
      trigger(TIME_PERIOD_START_FIELD_NAME);
    }
  }, []);

  return (
    <div className="time-period-field-root">
      <div className="time-period-field-container">
        <div
          className={clsx(
            "vkf-form-control",
            errors[TIME_PERIOD_START_FIELD_NAME] && "error"
          )}
        >
          <label
            className="vkf-form-label"
            htmlFor={TIME_PERIOD_START_FIELD_NAME}
          >
            {translate("geojson-label-timePeriod-start")}
          </label>

          <Controller
            control={control}
            name={TIME_PERIOD_START_FIELD_NAME}
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
              required: true,
              validate: (
                startDate,
                { [TIME_PERIOD_END_FIELD_NAME]: endDate }
              ) =>
                isValidLocalizedDate(startDate) &&
                isStartDateLessOrEqualThanEndDate(startDate, endDate),
            }}
          />
        </div>
        <div
          className={clsx(
            "vkf-form-control",
            errors[TIME_PERIOD_END_FIELD_NAME] && "error"
          )}
        >
          <label
            className="vkf-form-label"
            htmlFor={TIME_PERIOD_END_FIELD_NAME}
          >
            {translate("geojson-label-timePeriod-end")}
          </label>

          <Controller
            control={control}
            name={TIME_PERIOD_END_FIELD_NAME}
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
              required: true,
              validate: (
                endDate,
                { [TIME_PERIOD_START_FIELD_NAME]: startDate }
              ) =>
                isValidLocalizedDate(endDate) &&
                isStartDateLessOrEqualThanEndDate(startDate, endDate),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TimePeriodField;
