/*
 * Created by tom.schulze@pikobytes.de on 10.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import CustomButton from "../../components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import { vectorMapDrawState } from "@map/atoms";
import { useRecoilValue } from "recoil";
import { translate } from "@util/util";
import { VECTOR_MAP_TYPES } from "../../constants";
import {
  isVectorMapRolesEditorEditAllowed,
  isVectorMapRolesOwnerEditAllowed,
} from "../../util/authorization";

const GeoJsonControlBarRolesButton = ({ onClick }) => {
  const vectorMapDraw = useRecoilValue(vectorMapDrawState);
  const { type } = vectorMapDraw;

  const userIsAllowed = useMemo(() => {
    return (
      isVectorMapRolesEditorEditAllowed(vectorMapDraw) ||
      isVectorMapRolesOwnerEditAllowed(vectorMapDraw)
    );
  }, [vectorMapDraw]);

  return type === VECTOR_MAP_TYPES.REMOTE && userIsAllowed ? (
    <CustomButton
      className="control-bar-layer-buttons--button layer-roles-button"
      onClick={onClick}
      title={translate("geojson-control-bar-roles-btn-title")}
    >
      <VkfIcon name="user-roles" />
    </CustomButton>
  ) : null;
};

GeoJsonControlBarRolesButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default GeoJsonControlBarRolesButton;
