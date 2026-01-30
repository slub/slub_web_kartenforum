/*
 * Created by tom.schulze@pikobytes.de on 27.01.26.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import { isParsingWmsCapabilitiesAtom, selectableWmsLayersAtom } from "./atoms";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import SelectField from "@components/SelectField";
import { translate } from "@util/util";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import PropTypes from "prop-types";
import { hasWmsSelectableLayersAtom } from "./atoms";

import "./forms.scss";

const FORM_ID = "form-select-custom-wms-layer";
const FORM_FIELDS = {
  selectedLayer: "selectedLayer",
};

const FormSelectWmsLayer = ({ onSubmit, onClose }) => {
  const selectableWmsLayers = useRecoilValue(selectableWmsLayersAtom);
  const isParsing = useRecoilValue(isParsingWmsCapabilitiesAtom);
  const hasValidLayers = useRecoilValue(hasWmsSelectableLayersAtom);

  const [selectUpdateKey, setSelectUpdateKey] = useState(0);

  const selectDisabledHint = useMemo(() => {
    return !hasValidLayers
      ? translate("control-basemapselector-select-disabled-hint")
      : undefined;
  }, [hasValidLayers]);

  const selectOptions = useMemo(() => {
    return selectableWmsLayers.map(({ label, id }) => ({
      label,
      value: id,
    }));
  }, [selectableWmsLayers, hasValidLayers]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

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

  useEffect(() => {
    if (hasValidLayers) {
      reset({
        [FORM_FIELDS.selectedLayer]: selectOptions[0].value,
      });
      setSelectUpdateKey((old) => old + 1);
    }

    return () => {
      reset();
      setSelectUpdateKey((old) => old + 1);
    };
  }, [hasValidLayers, selectOptions, reset]);

  return (
    <>
      <form
        className="form-select-custom-wms-layer-root"
        id={FORM_ID}
        onSubmit={handleSubmit(handleSubmitWithSelectedLayerId)}
      >
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
              key={selectUpdateKey}
              className="vkf-form-input"
              {...register(FORM_FIELDS.selectedLayer, { required: true })}
              options={selectOptions}
              disabled={!hasValidLayers}
              title={selectDisabledHint}
            />
          </div>

          <div className="form-buttons">
            <CustomButton
              className="save-button"
              type="save"
              buttonType="submit"
              form={FORM_ID}
              disabled={isParsing || !hasValidLayers}
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
    </>
  );
};

FormSelectWmsLayer.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FormSelectWmsLayer;
