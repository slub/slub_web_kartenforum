/*
 * Created by tom.schulze@pikobytes.de on 22.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";

import { drawState, horizontalLayoutModeState } from "@map/atoms";
import { translate } from "@util/util";

import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";

import { HORIZONTAL_LAYOUT_MODE } from "@map/layouts/util";
import { useMapboxDrawInitializers } from "@map/components/GeoJson/MapboxDrawLoader/MapboxDrawLoader";

import "./GeoJsonControlBar.scss";

const VIEW_STATE = {
  DEFAULT: 1,
  NEW: 2,
  UPDATE: 3,
};

const GeoJsonControlBar = () => {
  const setHorizontalLayoutMode = useSetRecoilState(horizontalLayoutModeState);
  const draw = useRecoilValue(drawState);
  const { removeDraw } = useMapboxDrawInitializers();

  const viewState = 2;
  const featureCount = 1;

  const formattedFeatureCount = useMemo(() => {
    if (featureCount > 1) {
      return `${featureCount} ${translate(
        "geojson-control-bar-feature-plural"
      )}`;
    }

    return `1 ${translate("geojson-control-bar-feature")}`;
  }, [featureCount]);

  const handleSettingsPanelClick = useCallback(() => {
    console.log("settings panel");
  }, []);

  const handleHistoryClick = useCallback(() => {
    console.log("history");
  }, []);

  const handleSave = useCallback(() => {
    console.log(draw.getAll());
  });

  const handleClose = useCallback(() => {
    removeDraw().then(() => {
      setHorizontalLayoutMode(HORIZONTAL_LAYOUT_MODE.STANDARD);
    });
  }, [removeDraw]);

  return (
    <div className="vkf-geojson-control-bar-root">
      <div className="control-bar-header">
        <div className="control-bar-title">
          <span className="control-bar-title--static">
            {translate("geojson-control-bar-edit")}:{" "}
          </span>
          <span className="control-bar-title--dynamic">Test</span>
        </div>
        <div className="control-bar-layer-buttons">
          <CustomButton
            className="control-bar-layer-buttons--button layer-settings-button"
            onClick={handleSettingsPanelClick}
            title={translate("geojson-control-bar-settings-btn-title")}
          >
            <VkfIcon name="settings-panel" />
          </CustomButton>
          <CustomButton
            className="control-bar-layer-buttons--button layer-history-button"
            onClick={handleHistoryClick}
            title={translate("geojson-control-bar-history-btn-title")}
          >
            <VkfIcon name="clock" />
          </CustomButton>
        </div>
      </div>
      <div className="control-bar-main">
        {viewState === VIEW_STATE.DEFAULT && (
          <>
            <span className="bold">{formattedFeatureCount}</span>{" "}
            {translate("geojson-control-bar-features-present")}
          </>
        )}

        {viewState === VIEW_STATE.NEW && (
          <span className="bold">
            {translate("geojson-control-bar-add-feature")}
          </span>
        )}
      </div>
      <div className="control-bar-footer">
        <CustomButton
          className="discard-button"
          onClick={handleClose}
          type="discard"
        >
          <VkfIcon name="discard" />
          {translate("geojson-featureview-cancel-btn")}
        </CustomButton>
        <CustomButton className="save-button" onClick={handleSave} type="save">
          <VkfIcon name="save" />
          {translate("geojson-featureview-save-btn")}
        </CustomButton>
      </div>
    </div>
  );
};

GeoJsonControlBar.propTypes = {};

export default GeoJsonControlBar;
