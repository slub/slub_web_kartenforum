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
import React, { memo, useCallback, useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ImageWithFallback from "@map/components/GeoJson/components/ImageWithFallback";
import axios from "axios";

import {
  FORM_ID,
  metadataExternalToForm,
  formExternalToMetadata,
  validateFeatureCollection,
  CONTENT_TYPE_OPTIONS,
} from "../util";

import {
  atom,
  useRecoilCallback,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import {
  layerExternalVectorMapState,
  metadataExternalVectorMapState,
} from "@map/atoms";

import TimePeriodField from "@components/TimePeriodField";
import SelectField from "@components/SelectField";
import {
  TIME_PERIOD_END_FIELD_NAME,
  TIME_PERIOD_START_FIELD_NAME,
} from "../../core/util";

export const isExternalVectorMapFormLoadingState = atom({
  key: "isExternalVectorMapFormLoadingState",
  default: false,
});

// CSS comes from GeoJsonMetadataPanel/core/MetadataPanelForm.scss
// easiest way to centrally define form css for now, but not ideal. do not copy this pattern!
// better refactor to reusable css components and import scss in components

const FormExternalVectorMap = ({ onValidatedFormSubmit }) => {
  const data = useRecoilValue(metadataExternalVectorMapState);

  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    data[METADATA.thumbnailUrl] ?? ""
  );
  const setIsVectorMapFormLoading = useSetRecoilState(
    isExternalVectorMapFormLoadingState
  );

  const defaultValues = useMemo(() => metadataExternalToForm(data), [data]);
  const methods = useForm({
    defaultValues: defaultValues,
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = methods;

  const handleBlurThumbnailUrl = useCallback(
    (e) => setImagePreviewUrl(e.target.value),
    []
  );

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

        const metadata = formExternalToMetadata(data);

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
    <FormProvider {...methods}>
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
              errors[METADATA.externalContentType] && "error"
            )}
          >
            <label
              className="vkf-form-label"
              htmlFor={METADATA.externalContentType}
            >
              {translate("geojson-metadata-externalContentType")}
            </label>
            <SelectField
              className="vkf-form-input"
              {...register(METADATA.externalContentType, {
                required: true,
              })}
              options={CONTENT_TYPE_OPTIONS}
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
          <TimePeriodField
            startFieldName={TIME_PERIOD_START_FIELD_NAME}
            endFieldName={TIME_PERIOD_END_FIELD_NAME}
          />
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
    </FormProvider>
  );
};

FormExternalVectorMap.propTypes = {
  // ({metadata, geoJson}) => void
  onValidatedFormSubmit: PropTypes.func.isRequired,
};

export default memo(FormExternalVectorMap);
