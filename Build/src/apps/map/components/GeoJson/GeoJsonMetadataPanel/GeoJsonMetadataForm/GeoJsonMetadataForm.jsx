/*
 * Created by tom.schulze@pikobytes.de on 29.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import PropTypes from "prop-types";
import React from "react";
import { useForm } from "react-hook-form";
import { METADATA } from "@map/components/CustomLayers";
import clsx from "clsx";

import { translate } from "@util/util";

import "./GeoJsonMetadataForm.scss";

// TODO validate url
// TODO show url similar to GeoJsoNFeatureEditPanel
// TODO refactor to reduce boilerplate

const GeoJsonMetadataForm = ({ formId, data, onValidatedFormSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
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
          <input
            className="vkf-form-input"
            placeholder={translate("geojson-placeholder-thumbnailUrl")}
            defaultValue={data[METADATA.thumbnailUrl] ?? ""}
            {...register(METADATA.thumbnailUrl)}
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
