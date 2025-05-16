/*
 * Created by tom.schulze@pikobytes.de on 06.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo, useState } from "react";
import GeoJsonControlBar from "./GeoJsonControlBar";
import { useVectorMapExternalModeInitializers } from "../ExternalVectorMapLoader/ExternalVectorMapLoader";
import ExternalVectorMapControls from "./externalVectorMap/ExternalVectorMapControls";
import ExternalVectorMapContent from "./externalVectorMap/ExternalVectorMapContent";
import { useRecoilValue } from "recoil";
import {
  geojsonExternalVectorMapState,
  metadataExternalVectorMapState,
} from "@map/atoms";
import { METADATA } from "@map/components/CustomLayers";
import { isDefined } from "@util/util";
import { getFormattedFeatureCount } from "./util";
import useSaveExternalVectorMap from "../util/hooks/useSaveExternalVectorMap";

export const EXTERNAL_CONTROL_BAR_VIEW_STATE = {
  INITIAL: 0,
  SHOW_FEATURE_COUNT: 1,
  NO_TITLE: 2,
  NO_FEATURES: 3,
};

const GeoJsonControlBarExternalVectorMap = () => {
  const saveExternalVectorMap = useSaveExternalVectorMap();
  const [viewState, setViewState] = useState(
    EXTERNAL_CONTROL_BAR_VIEW_STATE.INITIAL
  );
  const metadata = useRecoilValue(metadataExternalVectorMapState);
  const geoJson = useRecoilValue(geojsonExternalVectorMapState);

  if (viewState === EXTERNAL_CONTROL_BAR_VIEW_STATE.INITIAL) {
    if (!isDefined(metadata[METADATA.title])) {
      setViewState(EXTERNAL_CONTROL_BAR_VIEW_STATE.NO_TITLE);
    } else {
      if (geoJson.features.length === 0) {
        setViewState(EXTERNAL_CONTROL_BAR_VIEW_STATE.NO_FEATURES);
      } else {
        setViewState(EXTERNAL_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT);
      }
    }
  } else if (viewState === EXTERNAL_CONTROL_BAR_VIEW_STATE.NO_TITLE) {
    if (isDefined(metadata[METADATA.title])) {
      if (geoJson.features.length === 0) {
        setViewState(EXTERNAL_CONTROL_BAR_VIEW_STATE.NO_FEATURES);
      } else {
        setViewState(EXTERNAL_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT);
      }
    }
  } else if (viewState === EXTERNAL_CONTROL_BAR_VIEW_STATE.NO_FEATURES) {
    if (geoJson.features.length > 0) {
      setViewState(EXTERNAL_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT);
    }
  }

  const formattedFeatureCount = useMemo(
    () => getFormattedFeatureCount(geoJson),
    [geoJson]
  );

  const isSaveButtonDisabled = useMemo(() => {
    const invalidTitle =
      !isDefined(metadata[METADATA.title]) || metadata[METADATA.title] === "";
    const invalidContentUrl = !isDefined(metadata[METADATA.externalContentUrl]);
    const invalidTimePeriod =
      !isDefined(metadata[METADATA.timePeriod]) ||
      metadata[METADATA.timePeriod].length === 0;

    return invalidContentUrl || invalidTimePeriod || invalidTitle;
  }, [metadata]);

  const { exitExternalVectorLayerMode } =
    useVectorMapExternalModeInitializers();

  const handleDiscard = useCallback(() => {
    exitExternalVectorLayerMode();
  }, []);

  const handleSave = useCallback(() => {
    return saveExternalVectorMap();
  }, []);

  return (
    <GeoJsonControlBar
      title={metadata[METADATA.title]}
      onDiscard={handleDiscard}
      onSave={handleSave}
      isSaveButtonDisabled={isSaveButtonDisabled}
      content={
        <ExternalVectorMapContent
          formattedFeatureCount={formattedFeatureCount}
          viewState={viewState}
        />
      }
      controls={<ExternalVectorMapControls />}
    />
  );
};

export default GeoJsonControlBarExternalVectorMap;
