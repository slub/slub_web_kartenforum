/*
 * Created by tom.schulze@pikobytes.de on 07.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { METADATA } from "@map/components/CustomLayers";
import { translate, isValidUrl } from "@util/util";
import clsx from "clsx";
import PropTypes from "prop-types";
import React, { memo, useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import ImageWithFallback from "@map/components/GeoJson/components/ImageWithFallback";
import axios from "axios";
import DateInput from "@components/DateInput";
import { isValidLocalizedDate, parseDateLocalized } from "@util/date";
import {
  FORM_ID,
  TIME_PERIOD_START,
  TIME_PERIOD_END,
  toFormValues,
  toMetadata,
  validateFeatureCollection,
} from "../util";

import "./FormExternalVectorMap.scss";
import { atom, useRecoilCallback, useSetRecoilState } from "recoil";
import { layerExternalVectorMapState } from "@map/atoms";

export const isExternalVectorMapFormLoadingState = atom({
  key: "isExternalVectorMapFormLoadingState",
  default: false,
});

const isStartDateLessOrEqualThanEndDate = (start, end) => {
  const startDate = parseDateLocalized(start);
  const endDate = parseDateLocalized(end);

  return startDate <= endDate;
};

const FormExternalVectorMap = ({ data, onValidatedFormSubmit }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    data[METADATA.thumbnailUrl] ?? ""
  );
  const setIsVectorMapFormLoading = useSetRecoilState(
    isExternalVectorMapFormLoadingState
  );

  const defaultValues = toFormValues(data);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    trigger,
    control,
  } = useForm({ defaultValues });

  const handleBlurThumbnailUrl = useCallback(
    (e) => setImagePreviewUrl(e.target.value),
    []
  );

  const handleStartDateChange = useCallback((val, { field, formState }) => {
    field.onChange(val);
    if (formState.errors[TIME_PERIOD_END]) {
      trigger(TIME_PERIOD_END);
    }
  }, []);

  const handleEndDateChange = useCallback((val, { field, formState }) => {
    field.onChange(val);
    if (formState.errors[TIME_PERIOD_START]) {
      trigger(TIME_PERIOD_START);
    }
  }, []);

  const handleSubmitWithGeoJson = useRecoilCallback(
    ({ snapshot }) =>
      async (data) => {
        setIsVectorMapFormLoading(true);

        const tempLayer = await snapshot.getPromise(
          layerExternalVectorMapState
        );
        const currentUrl = tempLayer.getMetadata()[METADATA.externalContentUrl];
        const urlToUpdate = data[METADATA.externalContentUrl];
        const hasUrlChanged = currentUrl !== urlToUpdate;

        const metadata = toMetadata(data);

        try {
          if (hasUrlChanged) {
            const response = await axios.get(urlToUpdate, {
              headers: { accept: "application/json" },
              timeout: 10 * 1000, // 10 s
            });

            const geoJson = response.data;

            validateFeatureCollection(geoJson);
            onValidatedFormSubmit({ geoJson, metadata });
          } else {
            onValidatedFormSubmit({ metadata });
          }
        } catch (error) {
          console.error(error);
          setError(
            METADATA.externalContentUrl,
            { type: "custom", message: "custom message" },
            { shouldFocus: true }
          );
        }

        setIsVectorMapFormLoading(false);
      },
    [onValidatedFormSubmit]
  );

  return (
    <form
      className="geojson-metadata-form-root"
      id={FORM_ID}
      onSubmit={handleSubmit(handleSubmitWithGeoJson)}
    >
      <div className="geojson-metadata-form-fields">
        <div
          className={clsx(
            "vkf-form-control",
            errors[METADATA.title] && "error"
          )}
        >
          <label className="vkf-form-label" htmlFor={METADATA.title}>
            {translate("geojson-metadata-title")}
          </label>
          <input
            className="vkf-form-input"
            placeholder={translate("geojson-placeholder-title")}
            {...register(METADATA.title, { required: true })}
          />
        </div>
        <div
          className={clsx(
            "vkf-form-control",
            errors[METADATA.externalContentUrl] && "error"
          )}
        >
          <label
            className="vkf-form-label"
            htmlFor={METADATA.externalContentUrl}
          >
            {translate("geojson-metadata-externalContentUrl")}
          </label>
          <input
            className="vkf-form-input"
            placeholder={translate("geojson-placeholder-externalContentUrl")}
            {...register(METADATA.externalContentUrl, {
              required: true,
              validate: (val) => isValidUrl(val),
            })}
          />
        </div>
        <div className="time-period-container">
          <div
            className={clsx(
              "vkf-form-control",
              errors[TIME_PERIOD_START] && "error"
            )}
          >
            <label className="vkf-form-label" htmlFor={TIME_PERIOD_START}>
              {translate("geojson-label-timePeriod-start")}
            </label>

            <Controller
              control={control}
              name={TIME_PERIOD_START}
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
                validate: (startDate, { [TIME_PERIOD_END]: endDate }) =>
                  isValidLocalizedDate(startDate) &&
                  isStartDateLessOrEqualThanEndDate(startDate, endDate),
              }}
            />
          </div>
          <div
            className={clsx(
              "vkf-form-control",
              errors[TIME_PERIOD_END] && "error"
            )}
          >
            <label className="vkf-form-label" htmlFor={TIME_PERIOD_END}>
              {translate("geojson-label-timePeriod-end")}
            </label>

            <Controller
              control={control}
              name={TIME_PERIOD_END}
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
                validate: (endDate, { [TIME_PERIOD_START]: startDate }) =>
                  isValidLocalizedDate(endDate) &&
                  isStartDateLessOrEqualThanEndDate(startDate, endDate),
              }}
            />
          </div>
        </div>
        <div
          className={clsx(
            "vkf-form-control",
            errors[METADATA.description] && "error"
          )}
        >
          <label className="vkf-form-label" htmlFor={METADATA.description}>
            {translate("geojson-metadata-description")}
          </label>
          <textarea
            className="vkf-form-textarea"
            placeholder={translate("geojson-placeholder-description")}
            {...register(METADATA.description)}
          />
        </div>
        <div
          className={clsx(
            "vkf-form-control",
            errors[METADATA.thumbnailUrl] && "error"
          )}
        >
          <label className="vkf-form-label" htmlFor={METADATA.thumbnailUrl}>
            {translate("geojson-metadata-thumbnailUrl")}
          </label>
          <div className="image-with-fallback-container">
            <ImageWithFallback
              imageUrl={imagePreviewUrl}
              showPlaceholder
              imageAsPreview
            />
          </div>
          <input
            className="vkf-form-input"
            placeholder={translate("geojson-placeholder-thumbnailUrl")}
            {...register(METADATA.thumbnailUrl, {
              onBlur: handleBlurThumbnailUrl,
              validate: (val) => val === "" || isValidUrl(val),
            })}
          />
        </div>
      </div>
    </form>
  );
};

FormExternalVectorMap.propTypes = {
  // ({metadata, geoJson}) => void
  onValidatedFormSubmit: PropTypes.func.isRequired,
  data: PropTypes.shape({
    [METADATA.title]: PropTypes.string,
    [METADATA.description]: PropTypes.string,
    [METADATA.thumbnailUrl]: PropTypes.string,
    [METADATA.externalContentUrl]: PropTypes.string,
    [METADATA.timePeriod]: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default memo(FormExternalVectorMap);
