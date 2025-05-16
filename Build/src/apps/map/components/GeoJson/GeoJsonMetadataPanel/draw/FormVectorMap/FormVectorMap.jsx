/*
 * Created by tom.schulze@pikobytes.de on 29.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import clsx from "clsx";
import PropTypes from "prop-types";
import React, { memo, useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { METADATA } from "@map/components/CustomLayers";
import { translate, isValidUrl } from "@util/util";

import ImageWithFallback from "../../../components/ImageWithFallback";
import TimePeriodField from "../../core/TimePeriodField";
import { formDrawToMetadata, metadataDrawToForm } from "../util";
import { useRecoilValue } from "recoil";
import { metadataDrawState } from "@map/atoms";

const validateThumbnailUrl = (val) => val === "" || isValidUrl(val);

// CSS comes from GeoJsonMetadataPanel/core/MetadataPanelForm.scss
// easiest way to centrally define form css for now, but not ideal. do not copy this pattern!
// better refactor to reusable css components and import scss in components

const GeoJsonMetadataForm = ({ formId, onValidatedFormSubmit }) => {
  const data = useRecoilValue(metadataDrawState);

  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    data[METADATA.thumbnailUrl] ?? ""
  );

  const defaultValues = useMemo(() => metadataDrawToForm(data), []);

  const methods = useForm({ defaultValues });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleBlurThumbnailUrl = useCallback(
    (e) => setImagePreviewUrl(e.target.value),
    []
  );

  const handleFormSubmit = useCallback(
    (data) => {
      const metadata = formDrawToMetadata(data);
      onValidatedFormSubmit(metadata);
    },
    [onValidatedFormSubmit]
  );

  return (
    <FormProvider {...methods}>
      <form
        className="geojson-metadata-form-root"
        id={formId}
        onSubmit={handleSubmit(handleFormSubmit)}
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
          <TimePeriodField />
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
                validate: validateThumbnailUrl,
              })}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

GeoJsonMetadataForm.defaultPropTypes = {};
GeoJsonMetadataForm.propTypes = {
  onValidatedFormSubmit: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
};

export default memo(GeoJsonMetadataForm);
