/*
 * Created by tom.schulze@pikobytes.de on 27.01.26.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { isParsingWmsCapabilitiesAtom, selectableWmsLayersAtom } from "./atoms";
import { FormProvider, useForm } from "react-hook-form";
import clsx from "clsx";
import SelectField from "@components/SelectField";
import { translate } from "@util/util";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import "./forms.scss";
import PropTypes from "prop-types";

const FORM_ID = "form-select-custom-wms-layer";
const FORM_FIELDS = {
  selectedLayer: "selectedLayer",
};

const FormSelectWmsLayer = ({ onSubmit, onClose }) => {
  const selectableWmsLayers = useRecoilValue(selectableWmsLayersAtom);
  const isParsing = useRecoilValue(isParsingWmsCapabilitiesAtom);

  const selectOptions = useMemo(() => {
    return selectableWmsLayers.map(({ label, id }) => ({
      label,
      value: id,
    }));
  }, [selectableWmsLayers]);

  const defaultValues = useMemo(
    () => ({
      [FORM_FIELDS.selectedLayer]: selectOptions[0].value,
    }),
    [selectOptions]
  );

  const methods = useForm({
    defaultValues: defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleSubmitWithSelectedLayerId = useCallback(
    (data) => {
      const selectedLayerId = data[FORM_FIELDS.selectedLayer];
      const selectedLayer = selectableWmsLayers.find(
        ({ id }) => id === selectedLayerId
      );
      onSubmit(selectedLayer);
    },
    [onSubmit, selectableWmsLayers]
  );

  return (
    <>
      <FormProvider {...methods}>
        <form
          className="form-select-custom-wms-layer-root"
          id={FORM_ID}
          onSubmit={handleSubmit(handleSubmitWithSelectedLayerId)}
        >
          <div className="form-description">
            <p>
              {translate("control-basemapselector-addwms-select-description")}
            </p>
          </div>

          <div className="form-wrapper">
            <div
              className={clsx(
                "vkf-form-control",
                errors[FORM_FIELDS.selectedLayer] && "error"
              )}
            >
              <label
                className="vkf-form-label"
                htmlFor={FORM_FIELDS.selectedLayer}
              >
                {translate("control-basemapselector-addwms-select-label")}
              </label>
              <SelectField
                className="vkf-form-input"
                {...register(FORM_FIELDS.selectedLayer, {
                  required: true,
                })}
                options={selectOptions}
              />
            </div>

            <div className="form-buttons">
              <CustomButton
                className="save-button"
                type="save"
                buttonType="submit"
                form={FORM_ID}
                disabled={isParsing}
              >
                <VkfIcon name="save" />
                {translate("control-basemapselector-addwms-btn-submit")}
              </CustomButton>

              <CustomButton
                className="cancel-button"
                type="discard"
                onClick={onClose}
              >
                {translate("control-basemapselector-addwms-btn-cancel")}
              </CustomButton>
            </div>
          </div>
        </form>
      </FormProvider>
    </>
  );
};

FormSelectWmsLayer.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FormSelectWmsLayer;
