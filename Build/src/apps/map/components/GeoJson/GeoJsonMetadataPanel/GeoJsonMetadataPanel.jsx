/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo } from "react";
import { useSetRecoilState } from "recoil";

import VkfIcon from "@components/VkfIcon";
import { translate } from "@util/util";
import { drawModePanelState } from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";

import DangerZone from "../components/DangerZone";
import GeoJsonPanelHeader from "../GeoJsonPanelHeader";
import CustomButton from "../components/CustomButton";

import GeoJsonMetadataForm from "./GeoJsonMetadataForm";

import "./GeoJsonMetadataPanel.scss";

const FORM_ID = "vkf-geojson-metadata-form";

const MetadataPanel = () => {
  const setDrawModePanel = useSetRecoilState(drawModePanelState);

  const introText = useMemo(() => {
    // {translate("geojson-metadata-panel-intro-create")}
    return translate("geojson-metadata-panel-intro-edit");
  }, []);

  const title = useMemo(() => {
    // {translate("geojson-metadata-panel-header-create")}
    return translate("geojson-metadata-panel-header-edit");
  }, []);

  const handleDeleteClick = useCallback(() => {
    console.log("delete");
  }, []);

  const handleCloseClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.NONE);
  }, []);

  const handleFormSubmit = useCallback((data) => {
    console.log("form submit", data);
    handleCloseClick();
  }, []);

  return (
    <div className="geojson-metadata-panel-root">
      <GeoJsonPanelHeader title={title} onCloseClick={handleCloseClick} />
      <div className="geojson-metadata-panel-content">
        <div className="introduction-text content-padding">{introText}</div>
        <div className="metadata-form-container content-padding">
          <GeoJsonMetadataForm
            formId={FORM_ID}
            onFormSubmit={handleFormSubmit}
          />
        </div>
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
          type="save"
          buttonType="submit"
          form={FORM_ID}
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
