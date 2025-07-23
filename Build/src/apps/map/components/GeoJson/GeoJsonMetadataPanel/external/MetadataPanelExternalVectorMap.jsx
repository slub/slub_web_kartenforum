/*
 * Created by tom.schulze@pikobytes.de on 07.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo } from "react";

import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  layerIdExternalVectorMapState,
  vectorMapExternalModePanelState,
} from "@map/atoms";
import { VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE } from "@map/layouts/util";
import { isDefined, translate } from "@util/util";
import FormExternalVectorMap from "./FormExternalVectorMap/FormExternalVectorMap";
import MetadataPanel from "../core/MetadataPanel";
import { isNewExternalVectorMap } from "../../util/hooks/useHorizontalExternalVectorMapMode";
import useUpdateExternalVectorMapLayer from "../../util/hooks/useUpdateExternalVectorMapLayer";
import useDeleteExternalVectorMap from "../../util/hooks/useDeleteExternalVectorMap";
import { useVectorMapExternalModeInitializers } from "../../ExternalVectorMapLoader";
import SubmitButton from "./SubmitButton";

import DangerZoneMetadataExternal from "../../components/DangerZone/DangerZoneMetadataExternal";
import useRefreshExternalVectorMap from "../../util/hooks/useRefreshExternalVectorMap";

const GeoJsonMetadataPanelExternalVectorMap = () => {
  const refreshExternalVectorMap = useRefreshExternalVectorMap();
  const deleteExternalVectorMap = useDeleteExternalVectorMap();
  const { updateExternalVectorMapLayer } = useUpdateExternalVectorMapLayer();
  const { exitExternalVectorLayerMode } =
    useVectorMapExternalModeInitializers();

  const externalVectorMapId = useRecoilValue(layerIdExternalVectorMapState);

  const setExternalModePanel = useSetRecoilState(
    vectorMapExternalModePanelState
  );
  const isExistingVectorMap = useMemo(
    () =>
      isDefined(externalVectorMapId) &&
      !isNewExternalVectorMap(externalVectorMapId),
    [externalVectorMapId]
  );

  const { introText, title } = useMemo(() => {
    if (!isDefined(externalVectorMapId)) {
      return { introText: "", title: "" };
    }

    if (isNewExternalVectorMap(externalVectorMapId)) {
      return {
        introText: translate("geojson-metadata-panel-intro-create-external"),
        title: translate("geojson-metadata-panel-header-create"),
      };
    }

    return {
      introText: translate("geojson-metadata-panel-intro-edit-external"),
      title: translate("geojson-metadata-panel-header-edit"),
    };
  }, [externalVectorMapId]);

  const handleValidatedFormSubmit = useCallback(({ geoJson, metadata }) => {
    updateExternalVectorMapLayer({ metadata, geoJson });
    handleClose();
  }, []);

  const handleClose = useCallback(
    () => setExternalModePanel(VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE.NONE),
    []
  );

  const handleDelete = useCallback(() => {
    deleteExternalVectorMap().then(() => exitExternalVectorLayerMode());
  }, []);

  const handleRefresh = useCallback(() => {
    return refreshExternalVectorMap();
  }, []);

  return (
    <MetadataPanel
      onClose={handleClose}
      onDelete={handleDelete}
      introText={introText}
      title={title}
      showDangerZone={isExistingVectorMap}
      dangerZoneComponent={
        <DangerZoneMetadataExternal
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />
      }
      formComponent={
        <FormExternalVectorMap
          onValidatedFormSubmit={handleValidatedFormSubmit}
        />
      }
      submitButton={<SubmitButton />}
    />
  );
};

export default GeoJsonMetadataPanelExternalVectorMap;
