/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo } from "react";
import { translate } from "@util/util";

import DangerZone from "../components/DangerZone";
import GeoJsonPanelHeader from "../GeoJsonPanelHeader";
import CustomButton from "../components/CustomButton";
import VkfIcon from "@components/VkfIcon";

import "./GeoJsonMetadataPanel.scss";
import { useSetRecoilState } from "recoil";
import { drawModePanelState } from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";

const MetadataPanel = () => {
  const setDrawModePanel = useSetRecoilState(drawModePanelState);

  const title = useMemo(() => {
    return translate("geojson-metadata-panel-header-edit");
  }, []);

  const handleDeleteClick = useCallback(() => {
    console.log("delete");
  }, []);

  const handleCloseClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.NONE);
  }, []);

  const handleSaveClick = useCallback(() => {
    console.log("save");
  }, []);

  return (
    <div className="geojson-metadata-panel-root">
      <GeoJsonPanelHeader title={title} onCloseClick={handleCloseClick} />
      <div className="geojson-metadata-panel-content">
        <div className="introduction-text content-padding">
          {translate("geojson-metadata-panel-intro")}
        </div>
        <div className="metadata-form-container content-padding"></div>
        <div className="danger-zone-container">
          <DangerZone
            description={translate("geojson-metadata-panel-delete")}
            onDeleteClick={handleDeleteClick}
            buttonLabel={translate("geojson-metadata-panel-delete-btn")}
          />
        </div>
      </div>
      <div className="footer-container">
        <CustomButton
          className="save-button"
          onClick={handleSaveClick}
          type="save"
        >
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

MetadataPanel.propTypes = {};

export default MetadataPanel;
