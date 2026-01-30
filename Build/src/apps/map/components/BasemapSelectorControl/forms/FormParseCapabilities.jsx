/*
 * Created by tom.schulze@pikobytes.de on 27.01.26.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import clsx from "clsx";
import React, { useEffect } from "react";
import { isDefined, isValidHttpsUrl, translate } from "@util/util";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  isParsingWmsCapabilitiesAtom,
  selectableWmsLayersAtom,
  useNotifyError,
  useResetSelectableLayers,
} from "./atoms";
import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMemo } from "react";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import { fetchAndParseWmsCapabilities } from "../util";

import "./forms.scss";

const FORM_ID = "form-parse-capabilities";
const FORM_FIELDS = {
  url: "url",
};
const URL_PLACEHOLDER =
  "https://meinwms.de?Request=GetCapabilities&Service=WMS&Version=1.3.0";

const FormParseCapabilities = () => {
  const [isLoading, setIsLoading] = useRecoilState(
    isParsingWmsCapabilitiesAtom
  );
  const setSelectableWmsLayers = useSetRecoilState(selectableWmsLayersAtom);
  const resetSelectableLayers = useResetSelectableLayers();
  const notifyError = useNotifyError();

  const defaultValues = useMemo(
    () => ({
      [FORM_FIELDS.url]: "",
    }),
    []
  );
  const methods = useForm({
    defaultValues: defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleFormSubmitWithParseWms = useCallback(async (data) => {
    const url = data[FORM_FIELDS.url];
    setIsLoading(true);

    try {
      const newLayers = await fetchAndParseWmsCapabilities(url);
      if (newLayers.length !== 0) {
        setSelectableWmsLayers(newLayers);
      }
    } catch (error) {
      console.log(error);
      resetSelectableLayers();
      notifyError(translate("dialog.add-wms.error.invalid-url"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isDefined(errors[FORM_FIELDS.url])) {
      return;
    }

    resetSelectableLayers();
  }, [errors[FORM_FIELDS.url]]);

  return (
    <>
      <FormProvider {...methods}>
        <form
          className="form-parse-wms-capabilities-root"
          id={FORM_ID}
          onSubmit={handleSubmit(handleFormSubmitWithParseWms)}
        >
          <div className="form-wrapper">
            <div
              className={clsx(
                "vkf-form-control",
                errors[FORM_FIELDS.url] && "error"
              )}
            >
              <label className="vkf-form-label" htmlFor={FORM_FIELDS.url}>
                {translate("control-basemapselector-addwms-input-label")}
              </label>
              <input
                className="vkf-form-input"
                placeholder={URL_PLACEHOLDER}
                {...register(FORM_FIELDS.url, {
                  required: true,
                  validate: (url) => isValidHttpsUrl(url),
                })}
              />
              <div
                className={clsx(
                  "vkf-form-error-hint",
                  errors[FORM_FIELDS.url] && "error"
                )}
              >
                {translate("control-basemapselector-invalid-url-error-hint")}
              </div>
            </div>

            <CustomButton
              className="save-button"
              type="save"
              buttonType="submit"
              form={FORM_ID}
              loading={isLoading}
            >
              {translate(
                "control-basemapselector-addwms-btn-load-capabilities"
              )}
            </CustomButton>
          </div>
        </form>
      </FormProvider>
    </>
  );
};

export default FormParseCapabilities;
