/*
 * Created by tom.schulze@pikobytes.de on 22.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";

import { initialGeoJsonDrawState, metadataDrawState } from "@map/atoms";
import { isDefined } from "@util/util";

import useSaveGeoJson from "@map/components/GeoJson/util/hooks/useSaveGeoJson";

import { useMapboxDrawInitializers } from "@map/components/GeoJson/MapboxDrawLoader/MapboxDrawLoader";
import { METADATA } from "@map/components/CustomLayers";
import GeoJsonControlBarDrawContent from "./draw/GeoJsonControlBarDrawContent";
import GeoJsonControlBarDrawControls from "./draw/GeoJsonControlBarDrawControls";

import { useGeoJsonFeatureDraw } from "../GeoJsonFeatureDrawLoader";

import GeoJsonControlBar from "./GeoJsonControlBar";
import { getFormattedFeatureCount } from "./util";

export const DRAW_CONTROL_BAR_VIEW_STATE = {
  INITIAL: 0,
  SHOW_FEATURE_COUNT: 1,
  NO_TITLE: 2,
  NO_FEATURES: 3,
  UNSAVED_FEATURE_CHANGES: 4,
};

const GeoJsonControlBarDraw = () => {
  const { removeDraw } = useMapboxDrawInitializers();
  const saveGeoJson = useSaveGeoJson();
  const { resetFeaturePreview } = useGeoJsonFeatureDraw();

  const metadataDraw = useRecoilValue(metadataDrawState);
  const initialGeoJson = useRecoilValue(initialGeoJsonDrawState);

  const [viewState, setViewState] = useState(
    DRAW_CONTROL_BAR_VIEW_STATE.INITIAL
  );

  if (viewState === DRAW_CONTROL_BAR_VIEW_STATE.INITIAL) {
    if (!isDefined(metadataDraw[METADATA.title])) {
      setViewState(DRAW_CONTROL_BAR_VIEW_STATE.NO_TITLE);
    } else {
      if (initialGeoJson.features.length === 0) {
        setViewState(DRAW_CONTROL_BAR_VIEW_STATE.NO_FEATURES);
      } else {
        setViewState(DRAW_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT);
      }
    }
  } else if (viewState === DRAW_CONTROL_BAR_VIEW_STATE.NO_TITLE) {
    if (isDefined(metadataDraw[METADATA.title])) {
      if (initialGeoJson.features.length === 0) {
        setViewState(DRAW_CONTROL_BAR_VIEW_STATE.NO_FEATURES);
      } else {
        setViewState(DRAW_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT);
      }
    }
  }

  const isSaveButtonDisabled = useMemo(() => {
    return (
      !isDefined(metadataDraw[METADATA.title]) ||
      metadataDraw[METADATA.title] === ""
    );
  }, [metadataDraw[METADATA.title]]);

  const formattedFeatureCount = useMemo(
    () => getFormattedFeatureCount(initialGeoJson),
    [initialGeoJson]
  );

  const handleSave = useCallback(() => {
    resetFeaturePreview();
    return saveGeoJson();
  }, [resetFeaturePreview, saveGeoJson]);

  const handleDiscard = useCallback(() => {
    removeDraw();
  }, [removeDraw]);

  return (
    <GeoJsonControlBar
      title={metadataDraw[METADATA.title]}
      onSave={handleSave}
      onDiscard={handleDiscard}
      isSaveButtonDisabled={isSaveButtonDisabled}
      controls={<GeoJsonControlBarDrawControls />}
      content={
        <GeoJsonControlBarDrawContent
          onUpdateViewMode={setViewState}
          viewState={viewState}
          formattedFeatureCount={formattedFeatureCount}
        />
      }
    />
  );
};

GeoJsonControlBarDraw.propTypes = {};

export default GeoJsonControlBarDraw;
