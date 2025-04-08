/*
 * Created by tom.schulze@pikobytes.de on 10.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useRecoilValue } from "recoil";
import React, { useCallback, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { isDefined, translate } from "@util/util";
import PropTypes from "prop-types";
import CustomButton from "../../components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import MultiValueInput from "./MultiValueInput";
import useVectorMapRolesQuery from "../useVectorMapRolesQuery";
import useSaveVectorMapRoles from "../useSaveVectorMapRoles";
import { FORM_FIELDS } from "../constants";
import { assembleDataForApi } from "../util";
import { vectorMapDrawState } from "@map/atoms";
import {
  isVectorMapRolesEditorEditAllowed,
  isVectorMapRolesOwnerEditAllowed,
} from "../../util/authorization";
import clsx from "clsx";

import "./GeoJsonRolesForm.scss";

const GEOJSON_ROLES_FORM_ID = "vkf-geojson-roles-form";
const LOCALIZATION_PLACEHOLDER = "PLACEHOLDER";

const userIsEitherEditorOrOwner = (_, formValues) => {
  const editors = formValues[FORM_FIELDS.EDITORS];
  const owners = formValues[FORM_FIELDS.OWNERS];

  for (const user of editors) {
    const idx = owners.findIndex((userId) => userId === user);
    if (idx !== -1) {
      let message = translate("geojson-roles-form.error.duplicateRoles");
      return message.replace(LOCALIZATION_PLACEHOLDER, `"${user}"`);
    }
  }

  return true;
};

const GeoJsonRolesForm = (props) => {
  const { onCancelClick = () => {}, onSubmitted = () => {} } = props;

  const [errorMessage, setErrorMessage] = useState("");

  const {
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm();

  const defaultValues = useVectorMapRolesQuery();
  const saveRoles = useSaveVectorMapRoles();
  const vectorMapDraw = useRecoilValue(vectorMapDrawState);

  const isUnsavedMap = useMemo(() => {
    return !isDefined(vectorMapDraw.id);
  }, [vectorMapDraw.id]);

  const handleValidatedSubmit = useCallback(
    (data) => {
      const roles = assembleDataForApi(data, defaultValues);

      // nothing has changed, don't send a request
      if (!isDefined(roles)) {
        onSubmitted();
        return;
      }

      saveRoles(roles)
        .then(() => {
          onSubmitted();
        })
        .catch((error) => {
          console.log(error);
          if (error.response) {
            if (error.response.status === 401) {
              setErrorMessage(translate("common-errors-http-401"));
              return;
            }

            if (error.response.status === 403) {
              setErrorMessage(translate("common-errors-http-403"));
              return;
            }
          }

          setErrorMessage(translate("common-errors-unexpected"));
        });
    },
    [onSubmitted]
  );

  const handleKeyDown = useCallback((event) => {
    if (
      event.key === "Enter" &&
      Object.values(FORM_FIELDS).includes(event.target.name)
    ) {
      event.preventDefault();
    }
  }, []);

  return (
    <div className="vkf-geojson-roles-form-root">
      <div className="intro-text">
        {isUnsavedMap
          ? translate("geojson-roles-form-intro-unsaved")
          : translate("geojson-roles-form-intro")}
      </div>
      <form
        id={GEOJSON_ROLES_FORM_ID}
        onSubmit={handleSubmit(handleValidatedSubmit)}
        onKeyDown={handleKeyDown}
      >
        <div
          className={clsx(
            "vkf-form-control",
            errors[FORM_FIELDS.OWNERS] && "error"
          )}
        >
          <label className="vkf-form-label">
            {translate("geojson-roles-owner")}
          </label>
          <Controller
            name={FORM_FIELDS.OWNERS}
            control={control}
            defaultValue={defaultValues.owners}
            rules={{ required: translate("geojson-roles-form.error.required") }}
            render={({ field }) => (
              <MultiValueInput
                {...field}
                onChange={(value) => {
                  field.onChange(value);
                  trigger(FORM_FIELDS.EDITORS);
                  setErrorMessage("");
                }}
                disabled={!isVectorMapRolesOwnerEditAllowed(vectorMapDraw)}
                placeholder={translate("geojson-roles-insert-username")}
              />
            )}
          />
          {errors[FORM_FIELDS.OWNERS] && (
            <div className="vkf-form-error">
              {errors[FORM_FIELDS.OWNERS].message}
            </div>
          )}
        </div>

        <div
          className={clsx(
            "vkf-form-control",
            errors[FORM_FIELDS.EDITORS] && "error"
          )}
        >
          <label className="vkf-form-label">
            {translate("geojson-roles-authors")}
          </label>
          <Controller
            name={FORM_FIELDS.EDITORS}
            control={control}
            defaultValue={defaultValues.editors}
            rules={{
              validate: userIsEitherEditorOrOwner,
            }}
            render={({ field }) => (
              <MultiValueInput
                {...field}
                onChange={(value) => {
                  field.onChange(value);
                  trigger(FORM_FIELDS.EDITORS);
                  setErrorMessage("");
                }}
                disabled={!isVectorMapRolesEditorEditAllowed(vectorMapDraw)}
                placeholder={translate("geojson-roles-insert-username")}
              />
            )}
          />
          {errors[FORM_FIELDS.EDITORS] && (
            <div className="vkf-form-error">
              {errors[FORM_FIELDS.EDITORS].message}
            </div>
          )}
        </div>
      </form>
      {errorMessage.length !== "" && (
        <div className="error-message">{errorMessage}</div>
      )}
      <div className="buttons">
        <CustomButton
          form={GEOJSON_ROLES_FORM_ID}
          disabled={
            !isVectorMapRolesEditorEditAllowed(vectorMapDraw) &&
            !isVectorMapRolesOwnerEditAllowed(vectorMapDraw)
          }
          buttonType="submit"
          type="save"
          className="submit-button"
        >
          <VkfIcon name="save" />
          {translate("geojson-roles-btn-save")}
        </CustomButton>
        <CustomButton
          className="cancel-button"
          type="discard"
          onClick={onCancelClick}
        >
          <VkfIcon name="discard" />
          {translate("geojson-cancel-btn")}
        </CustomButton>
      </div>
    </div>
  );
};

GeoJsonRolesForm.propTypes = {
  onCancelClick: PropTypes.func,
  onSubmitted: PropTypes.func,
};

export default GeoJsonRolesForm;
