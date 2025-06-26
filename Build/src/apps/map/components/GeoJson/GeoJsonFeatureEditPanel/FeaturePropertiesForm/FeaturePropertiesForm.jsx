/*
 * Created by tom.schulze@pikobytes.de on 23.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import PropTypes from "prop-types";
import { translate } from "@util/util";
import StyleField from "../StyleField/StyleField";
import { styleFieldSettings } from "../../constants";

import { FEATURE_PROPERTIES_FORM_ID } from "../GeoJsonFeatureEditPanel";
import {
  isValidCustomPropertyFieldName,
  isValidCustomPropertyFieldValue,
  validateStyleValue,
  featurePropertiesToFormProperties,
  formPropertiesToFeatureProperties,
} from "./util";
import ImageField from "../ImageField";
import AddFieldButton from "../AddFieldButton";
import RemoveFieldButton from "../RemoveFieldButton";
import TimePeriodField from "@components/TimePeriodField";

import "./FeaturePropertiesForm.scss";
import clsx from "clsx";

const FeaturePropertiesForm = ({ feature, onSavePreview, onFormSubmit }) => {
  const data = useMemo(
    () => featurePropertiesToFormProperties(feature),
    [feature.id]
  );
  const { img_link, title, description } = data;

  const methods = useForm({
    defaultValues: data,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = methods;

  const handleValidatedFormSubmit = useCallback(
    (data) => {
      data = formPropertiesToFeatureProperties(data);

      onFormSubmit(data);
    },
    [onFormSubmit]
  );

  const { fields: styleFields } = useFieldArray({
    name: "styleProps",
    control,
  });

  const {
    fields: customFields,
    append,
    remove,
  } = useFieldArray({
    name: "customProps",
    control,
  });

  const handleRemoveFieldClick = useCallback(
    (index) => {
      remove(index);
    },
    [remove]
  );

  const handleAddFieldClick = useCallback(() => {
    append([{ name: "", value: "" }]);
  }, [append]);

  return (
    <FormProvider {...methods}>
      <form
        id={FEATURE_PROPERTIES_FORM_ID}
        onSubmit={handleSubmit(handleValidatedFormSubmit)}
        noValidate
      >
        <div className="feature-properties-form-root">
          <div className="style-property-header">
            <p className="header-text">
              {translate("geojson-editfeature-style-header")}
            </p>
          </div>

          <div className="style-fields">
            {styleFields.map((field, index) => {
              const propKey = field.name;

              const inputProps = styleFieldSettings[propKey];
              const { onChange, ...registerProps } = register(
                `styleProps.${index}.value`
              );
              return (
                <StyleField
                  {...registerProps}
                  onChange={(event) => {
                    const newValue = validateStyleValue(
                      propKey,
                      event.target.value
                    );
                    onSavePreview(propKey, newValue);
                    onChange(event);
                  }}
                  key={field.id}
                  id={field.id}
                  title={propKey}
                  {...inputProps}
                />
              );
            })}
          </div>
          <div className="non-style-fields">
            <ImageField {...register("img_link")} defaultValue={img_link} />

            <div className="vkf-form-control non-style-property-item">
              <label
                className="vkf-form-label with-border"
                htmlFor="vkf-props-title"
              >
                title
              </label>

              <input
                id="vkf-props-title"
                className="vkf-form-input"
                {...register("title")}
                defaultValue={title}
                placeholder={translate("geojson-editfeature-input-placeholder")}
              />
            </div>

            <div className="vkf-form-control non-style-property-item">
              <label
                className="vkf-form-label with-border"
                htmlFor="vkf-props-description"
              >
                description
              </label>
              <input
                id="vkf-props-description"
                className="vkf-form-input"
                {...register("description")}
                defaultValue={description}
                placeholder={translate("geojson-editfeature-input-placeholder")}
              />
            </div>
            <div className="time-period-field-wrapper">
              <label className="vkf-form-label with-border">time</label>
              <TimePeriodField
                startFieldName="timeStart"
                endFieldName="timeEnd"
                showLabels={false}
                required={false}
              />
            </div>

            {customFields.map((field, index) => {
              const fieldNameProps = register(`customProps.${index}.name`, {
                validate: (value, fields) =>
                  isValidCustomPropertyFieldName(value, fields, index),
              });

              const fieldValueProps = register(`customProps.${index}.value`, {
                validate: (value, fields) =>
                  isValidCustomPropertyFieldValue(value, fields, index),
              });
              return (
                <div key={field.id} className="custom-field-wrapper">
                  <div
                    className={clsx(
                      "vkf-form-control ",
                      errors?.customProps?.[index]?.name && "error"
                    )}
                  >
                    <input
                      {...fieldNameProps}
                      className="vkf-form-input as-label"
                      placeholder={translate(
                        "geojson-editfeature-label-placeholder"
                      )}
                    />
                  </div>
                  <div
                    className={clsx(
                      "vkf-form-control ",
                      errors?.customProps?.[index]?.value && "error"
                    )}
                  >
                    <input
                      {...fieldValueProps}
                      className="vkf-form-input"
                      placeholder={translate(
                        "geojson-editfeature-input-placeholder"
                      )}
                    />
                    <RemoveFieldButton
                      onClick={() => handleRemoveFieldClick(index)}
                    />
                  </div>
                </div>
              );
            })}

            <AddFieldButton onClick={handleAddFieldClick} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

FeaturePropertiesForm.propTypes = {
  feature: PropTypes.shape({
    properties: PropTypes.object,
    geometry: PropTypes.object,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onSavePreview: PropTypes.func.isRequired,
  onFormSubmit: PropTypes.func.isRequired,
};

export default FeaturePropertiesForm;
