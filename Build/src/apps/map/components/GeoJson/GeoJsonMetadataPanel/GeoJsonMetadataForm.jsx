/*
 * Created by tom.schulze@pikobytes.de on 29.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import PropTypes from "prop-types";
import React from "react";
import { useForm } from "react-hook-form";

const METADATA = {
  title: "title",
  description: "description",
  imgLink: "img_link",
};

const GeoJsonMetadataForm = ({ formId, onFormSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <form id={formId} onSubmit={handleSubmit(onFormSubmit)}>
      <input {...register(METADATA.title, { required: true })} />
      {errors[METADATA.title] && <span>This field is required</span>}
      <input {...register(METADATA.description)} />
      <input {...register(METADATA.imgLink)} />
    </form>
  );
};

GeoJsonMetadataForm.defaultPropTypes = {};
GeoJsonMetadataForm.propTypes = {
  onFormSubmit: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
};

export default GeoJsonMetadataForm;
