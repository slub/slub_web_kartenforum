/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo } from "react";
import { useSetRecoilState, useRecoilState, useRecoilValue } from "recoil";

import { translate, isDefined } from "@util/util";
import {
  drawModePanelState,
  metadataDrawState,
  vectorMapDrawState,
} from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";

import { VECTOR_MAP_TYPES } from "../../constants";
import useDeleteGeojson from "../../util/hooks/useDeleteGeoJson";

import GeoJsonMetadataPanel from "../core/MetadataPanel";
import FormVectorMap from "./FormVectorMap";
import VkfIcon from "@components/VkfIcon";
import CustomButton from "../../components/CustomButton";
import DangerZoneMetadataDraw from "../../components/DangerZone/DangerZoneMetadataDraw";

const FORM_ID = "vkf-geojson-metadata-form";

const MetadataPanelDraw = () => {
  const setDrawModePanel = useSetRecoilState(drawModePanelState);
  const [metadataDraw, setMetadataDraw] = useRecoilState(metadataDrawState);
  const vectorMapDraw = useRecoilValue(vectorMapDrawState);
  const deleteGeoJson = useDeleteGeojson();

  const { introText, title } = useMemo(() => {
    if (!isDefined(vectorMapDraw)) {
      return { introText: "", title: "" };
    }

    const { type, id } = vectorMapDraw;

    const edit = {
      introText: translate("geojson-metadata-panel-intro-edit"),
      title: translate("geojson-metadata-panel-header-edit"),
    };

    const create = {
      introText: translate("geojson-metadata-panel-intro-create"),
      title: translate("geojson-metadata-panel-header-create"),
    };

    if (type === VECTOR_MAP_TYPES.REMOTE) {
      if (isDefined(id)) {
        return edit;
      }
      return create;
    }

    return edit;
  }, [vectorMapDraw]);

  const isExistingVectorMap = useMemo(() => {
    if (!isDefined(vectorMapDraw)) {
      return false;
    }

    const { type, id } = vectorMapDraw;

    return type === VECTOR_MAP_TYPES.REMOTE && isDefined(id);
  }, [vectorMapDraw]);

  const handleDelete = useCallback(() => {
    deleteGeoJson();
  }, [deleteGeoJson]);

  const handleClose = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.NONE);
  }, []);

  const handleValidatedFormSubmit = useCallback((data) => {
    setMetadataDraw(data);
    handleClose();
  }, []);

  return (
    <GeoJsonMetadataPanel
      introText={introText}
      title={title}
      onClose={handleClose}
      onDelete={handleDelete}
      showDangerZone={isExistingVectorMap}
      dangerZoneComponent={<DangerZoneMetadataDraw onDelete={handleDelete} />}
      formComponent={
        <FormVectorMap
          data={metadataDraw}
          onValidatedFormSubmit={handleValidatedFormSubmit}
          formId={FORM_ID}
        />
      }
      submitButton={
        <CustomButton
          className="save-button"
          type="save"
          buttonType="submit"
          form={FORM_ID}
        >
          <VkfIcon name="save" />
          {translate("geojson-apply-btn")}
        </CustomButton>
      }
    />
  );
};

MetadataPanelDraw.propTypes = {};

export default MetadataPanelDraw;
