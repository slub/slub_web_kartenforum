/*
 * Created by tom.schulze@pikobytes.de on 29.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import clsx from "clsx";
import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import { METADATA } from "@map/components/CustomLayers";
import { translate } from "@util/util";

import ImageWithFallback from "../../components/ImageWithFallback";

import "./GeoJsonMetadataForm.scss";

// refactor before extending the form to reduce boilerplate

const validateThumbnailUrl = (val) => val === "" || URL.canParse(val);

const GeoJsonMetadataForm = ({ formId, data, onValidatedFormSubmit }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    data[METADATA.thumbnailUrl] ?? ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleBlurThumbnailUrl = useCallback(
    (e) => setImagePreviewUrl(e.target.value),
    []
  );

  return (
    <form
      className="geojson-metadata-form-root"
      id={formId}
      onSubmit={handleSubmit(onValidatedFormSubmit)}
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
            defaultValue={data[METADATA.title] ?? ""}
            {...register(METADATA.title, { required: true })}
          />
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
            defaultValue={data[METADATA.description] ?? ""}
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
            defaultValue={data[METADATA.thumbnailUrl] ?? ""}
            {...register(METADATA.thumbnailUrl, {
              onBlur: handleBlurThumbnailUrl,
              validate: validateThumbnailUrl,
            })}
          />
        </div>
      </div>
    </form>
  );
};

GeoJsonMetadataForm.defaultPropTypes = {};
GeoJsonMetadataForm.propTypes = {
  onValidatedFormSubmit: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
  data: PropTypes.shape({
    [METADATA.title]: PropTypes.string,
    [METADATA.description]: PropTypes.string,
    [METADATA.thumbnailUrl]: PropTypes.string,
  }),
};

export default GeoJsonMetadataForm;
