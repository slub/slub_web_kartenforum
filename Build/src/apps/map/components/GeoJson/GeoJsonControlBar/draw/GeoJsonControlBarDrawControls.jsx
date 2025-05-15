/*
 * Created by tom.schulze@pikobytes.de on 06.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useState, useCallback } from "react";

import { useRecoilValue, useSetRecoilState } from "recoil";

import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";
import { drawModePanelState, vectorMapDrawState } from "@map/atoms";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import GeoJsonControlBarHistoryButton from "./GeoJsonControlBarHistoryButton";
import GeoJsonControlBarRolesButton from "./GeoJsonControlBarRolesButton";
import DialogRoles from "@map/components/GeoJson/GeoJsonRoles";
import { isVectorMapMetadataEditAllowed } from "@map/components/GeoJson/util/authorization";

import { translate } from "@util/util";

const GeoJsonControlBarDrawControls = () => {
  const MODAL_STATE = {
    NONE: 0,
    ROLES: 1,
  };

  const [modalState, setModalState] = useState(MODAL_STATE.NONE);

  const vectorMapDraw = useRecoilValue(vectorMapDrawState);
  const setDrawModePanel = useSetRecoilState(drawModePanelState);

  const handleModalClose = useCallback(() => {
    setModalState(MODAL_STATE.NONE);
  }, []);

  const handleMetadataPanelClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.METADATA);
  }, []);

  const handleHistoryClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.HISTORY);
  }, []);

  const handleRolesClick = useCallback(() => {
    setModalState(MODAL_STATE.ROLES);
  }, []);

  return (
    <>
      {isVectorMapMetadataEditAllowed(vectorMapDraw) && (
        <CustomButton
          className="control-bar-layer-buttons--button layer-metadata-button"
          onClick={handleMetadataPanelClick}
          title={translate("geojson-control-bar-metadata-btn-title")}
        >
          <VkfIcon name="metadata-panel" />
        </CustomButton>
      )}
      <GeoJsonControlBarHistoryButton onClick={handleHistoryClick} />
      <GeoJsonControlBarRolesButton onClick={handleRolesClick} />
      <DialogRoles
        show={modalState === MODAL_STATE.ROLES}
        onClose={handleModalClose}
      />
    </>
  );
};

export default GeoJsonControlBarDrawControls;
