/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";
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
      <GeoJsonPanelHeader
        title={"Vektor-Karte bearbeiten"}
        onCloseClick={handleCloseClick}
      />
      <div className="introduction">
        Bearbeiten Sie hier die Einstellungen für die gesamte Vektor-Karte. Sie
        können hier Titel, Beschreibung und Vorschaubild bestimmen.
      </div>
      <div className="metadata-form-container"></div>
      <DangerZone
        title={"Diese Vektor-Karte löschen"}
        onDeleteClick={handleDeleteClick}
        buttonLabel={"Vektor-Karte löschen"}
      />
      <div className="footer-container">
        <CustomButton
          className="save-button"
          onClick={handleSaveClick}
          type="save"
        >
          <VkfIcon name="save" />
          {translate("geojson-featureview-save-btn")}
        </CustomButton>
        <CustomButton
          className="discard-button"
          onClick={handleCloseClick}
          type="discard"
        >
          <VkfIcon name="discard" />
          {translate("geojson-featureview-cancel-btn")}
        </CustomButton>
      </div>
    </div>
  );
};

MetadataPanel.propTypes = {};

export default MetadataPanel;
