/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { Suspense, useCallback, useMemo } from "react";
import { useSetRecoilState } from "recoil";

import VkfIcon from "@components/VkfIcon";
import { translate } from "@util/util";
import { drawModePanelState } from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";
import GeoJsonPanelHeader from "../GeoJsonPanelHeader";
import CustomButton from "../components/CustomButton";
import VersionHistory from "@map/components/GeoJson/GeoJsonHistoryPanel/VersionHistory/VersionHistory";

import "./GeoJsonHistoryPanel.scss";

const HistoryPanel = () => {
  const setDrawModePanel = useSetRecoilState(drawModePanelState);

  const introText = useMemo(() => {
    // {translate("geojson-metadata-panel-intro-create")}
    return translate("geojson-metadata-panel-intro-edit");
  }, []);

  const title = useMemo(() => {
    // {translate("geojson-metadata-panel-header-create")}
    return translate("geojson-metadata-panel-header-edit");
  }, []);

  const handleCloseClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.NONE);
  }, []);

  //@TODO: Render the history correctly
  //@TODO: Style the history correctly
  //@TODO: Set the correct texts here
  return (
    <div className="geojson-metadata-panel-root">
      <GeoJsonPanelHeader title={title} onCloseClick={handleCloseClick} />
      <div className="geojson-metadata-panel-content">
        <div className="introduction-text content-padding">{introText}</div>
        <div className="metadata-form-container content-padding">
          <Suspense fallback={<div>Loading...</div>}>
            <VersionHistory />
          </Suspense>
        </div>
      </div>
      <div className="footer-container">
        <CustomButton className="save-button" type="save">
          <VkfIcon name="save" />
          {translate("geojson-apply-btn")}
        </CustomButton>
        <CustomButton
          className="discard-button"
          onClick={handleCloseClick}
          type="discard"
        >
          <VkfIcon name="discard" />
          {translate("geojson-cancel-btn")}
        </CustomButton>
      </div>
    </div>
  );
};

HistoryPanel.propTypes = {};

export default HistoryPanel;
