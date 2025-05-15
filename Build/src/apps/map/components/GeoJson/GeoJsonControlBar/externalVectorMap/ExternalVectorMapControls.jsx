/*
 * Created by tom.schulze@pikobytes.de on 06.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";

import { useSetRecoilState } from "recoil";
import CustomButton from "../../components/CustomButton";
import { isExternalVectorMapMetadataEditAllowed } from "../../util/authorization";
import { vectorMapExternalModePanelState } from "@map/atoms";
import { VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE } from "@map/layouts/util";
import { translate } from "@util/util";
import VkfIcon from "@components/VkfIcon";

const ExternalVectorMapControls = () => {
  const setExternalModePanel = useSetRecoilState(
    vectorMapExternalModePanelState
  );

  const handleMetadataPanelClick = useCallback(() => {
    setExternalModePanel(VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE.METADATA);
  }, []);

  return (
    <>
      {isExternalVectorMapMetadataEditAllowed() && (
        <CustomButton
          className="control-bar-layer-buttons--button layer-metadata-button"
          onClick={handleMetadataPanelClick}
          title={translate("geojson-control-bar-metadata-btn-title")}
        >
          <VkfIcon name="metadata-panel" />
        </CustomButton>
      )}
    </>
  );
};

export default ExternalVectorMapControls;
