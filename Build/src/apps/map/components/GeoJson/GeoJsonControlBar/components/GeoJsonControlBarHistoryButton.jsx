/**
 * Created by nicolas.looschen@pikobytes.de on 05.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import { isVectorMapHistoryViewAllowed } from "@map/components/GeoJson/util/authorization";
import { translate } from "@util/util";
import VkfIcon from "@components/VkfIcon";
import React from "react";
import { useRecoilValue } from "recoil";
import {
  vectorMapActiveVersionDrawState,
  vectorMapDrawState,
} from "@map/atoms";
import PropTypes from "prop-types";
import clsx from "clsx";

export const GeoJsonControlBarHistoryButton = ({ onClick }) => {
  const activeVersion = useRecoilValue(vectorMapActiveVersionDrawState);
  const vectorMapDraw = useRecoilValue(vectorMapDrawState);

  return vectorMapDraw?.type === "remote" ? (
    <CustomButton
      disabled={!isVectorMapHistoryViewAllowed(vectorMapDraw)}
      className="control-bar-layer-buttons--button layer-history-button"
      onClick={onClick}
      title={translate("geojson-control-bar-history-btn-title")}
    >
      <span
        className={clsx(
          "control-bar-layer-buttons--badge",
          activeVersion !== null && "in"
        )}
      />
      <VkfIcon name="clock" />
    </CustomButton>
  ) : null;
};

GeoJsonControlBarHistoryButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default GeoJsonControlBarHistoryButton;
