/*
 * Created by tom.schulze@pikobytes.de on 10.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useRecoilValue } from "recoil";
import React, { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { translate } from "@util/util";
import PropTypes from "prop-types";
import CustomButton from "../../components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import MultiValueInput from "./MultiValueInput";
import useVectorMapRolesQuery from "../useVectorMapRolesQuery";
import useSaveVectorMapRoles from "../useSaveVectorMapRoles";
import { FORM_FIELDS } from "../constants";
import { assembleDataForApi } from "../util";
import { vectorMapDrawState } from "@map/atoms";

import "./GeoJsonRolesForm.scss";
import {
  isVectorMapRolesEditorEditAllowed,
  isVectorMapRolesOwnerEditAllowed,
} from "../../util/authorization";

const GEOJSON_ROLES_FORM_ID = "vkf-geojson-roles-form";

const GeoJsonRolesForm = (props) => {
  const { onCancelClick = () => {}, onSubmitted = () => {} } = props;

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const defaultValues = useVectorMapRolesQuery();
  const saveRoles = useSaveVectorMapRoles();
  const vectorMapDraw = useRecoilValue(vectorMapDrawState);

  const handleValidatedSubmit = useCallback(
    (data) => {
      console.log(data);

      const roles = assembleDataForApi(data, defaultValues);

      saveRoles(roles)
        .then(() => {
          onSubmitted();
        })
        .catch((error) => {
          // TODO error handling
          console.log(error);
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
      <div className="intro-text">{translate("geojson-roles-form-intro")}</div>
      <form
        id={GEOJSON_ROLES_FORM_ID}
        onSubmit={handleSubmit(handleValidatedSubmit)}
        onKeyDown={handleKeyDown}
      >
        <Controller
          name={FORM_FIELDS.OWNERS}
          control={control}
          defaultValue={defaultValues.owners}
          rules={{ required: true }}
          disabled={!isVectorMapRolesOwnerEditAllowed(vectorMapDraw)}
          render={({ field }) => (
            <MultiValueInput {...field} readOnly={field.disabled} />
          )}
        />

        <Controller
          name={FORM_FIELDS.EDITORS}
          control={control}
          defaultValue={defaultValues.editors}
          disabled={!isVectorMapRolesEditorEditAllowed(vectorMapDraw)}
          render={({ field }) => (
            <MultiValueInput {...field} readOnly={field.disabled} />
          )}
        />
      </form>

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
