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

const GeoJsonMetadataForm = ({ formId, data, onValidatedFormSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <form id={formId} onSubmit={handleSubmit(onValidatedFormSubmit)}>
      <input
        defaultValue={data[METADATA.title] ?? ""}
        {...register(METADATA.title, { required: true })}
      />
      {errors[METADATA.title] && <span>This field is required</span>}
      <input
        defaultValue={data[METADATA.description] ?? ""}
        {...register(METADATA.description)}
      />
      <input
        defaultValue={data[METADATA.thumbnailUrl] ?? ""}
        {...register(METADATA.thumbnailUrl)}
      />
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
