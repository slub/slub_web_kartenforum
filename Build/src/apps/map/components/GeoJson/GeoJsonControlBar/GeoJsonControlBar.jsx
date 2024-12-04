/*
 * Created by tom.schulze@pikobytes.de on 22.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import {
  horizontalLayoutModeState,
  drawModePanelState,
  vectorMapDrawState,
  metadataDrawState,
  initialGeoJsonDrawState,
} from "@map/atoms";
import { translate, isDefined } from "@util/util";

import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import useSaveGeoJson from "@map/components/GeoJson/util/hooks/useSaveGeoJson";
import {
  isVectorMapHistoryViewAllowed,
  isVectorMapMetadataEditAllowed,
} from "@map/components/GeoJson/util/authorization";

import {
  HORIZONTAL_LAYOUT_MODE,
  DRAW_MODE_PANEL_STATE,
} from "@map/layouts/util";
import { useMapboxDrawInitializers } from "@map/components/GeoJson/MapboxDrawLoader/MapboxDrawLoader";
import { METADATA } from "@map/components/CustomLayers";

import "./GeoJsonControlBar.scss";
import GeoJsonControlBarContent from "@map/components/GeoJson/GeoJsonControlBar/components/GeoJsonControlBarContent";

export const GEOJSON_CONTROL_BAR_VIEW_STATE = {
  INITIAL: 0,
  DEFAULT: 1,
  NO_TITLE: 2,
  NO_FEATURES: 3,
  UNSAVED_FEATURE_CHANGES: 4,
};

const GeoJsonControlBar = () => {
  const setHorizontalLayoutMode = useSetRecoilState(horizontalLayoutModeState);
  const setDrawModePanel = useSetRecoilState(drawModePanelState);
  const { removeDraw } = useMapboxDrawInitializers();
  const saveGeoJson = useSaveGeoJson();
  const vectorMapDraw = useRecoilValue(vectorMapDrawState);
  const metadataDraw = useRecoilValue(metadataDrawState);
  const initialGeoJson = useRecoilValue(initialGeoJsonDrawState);

  const [viewState, setViewState] = useState(
    GEOJSON_CONTROL_BAR_VIEW_STATE.INITIAL
  );

  // TODO improve and finalize, just a draft state machine
  if (viewState === GEOJSON_CONTROL_BAR_VIEW_STATE.INITIAL) {
    if (!isDefined(metadataDraw[METADATA.title])) {
      setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.NO_TITLE);
    } else {
      if (initialGeoJson.features.length === 0) {
        setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.NO_FEATURES);
      } else {
        setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.DEFAULT);
      }
    }
  } else if (viewState === GEOJSON_CONTROL_BAR_VIEW_STATE.NO_TITLE) {
    if (isDefined(metadataDraw[METADATA.title])) {
      if (initialGeoJson.features.length === 0) {
        setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.NO_FEATURES);
      } else {
        setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.DEFAULT);
      }
    }
  }

  const layerTitle = useMemo(() => {
    const title = metadataDraw[METADATA.title] ?? "";

    if (title === "") {
      return `[${translate("geojson-featureview-no-title")}]`;
    }

    return title;
  }, [metadataDraw[METADATA.title]]);

  const formattedFeatureCount = useMemo(() => {
    const featureCount = initialGeoJson.features.length;
    if (featureCount > 1) {
      return `${featureCount} ${translate(
        "geojson-control-bar-feature-plural"
      )}`;
    }

    return `1 ${translate("geojson-control-bar-feature")}`;
  }, [initialGeoJson]);

  const handleMetadataPanelClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.METADATA);
  }, []);

  const handleHistoryClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.HISTORY);
  }, []);

  const handleSave = useCallback(() => {
    console.log("handle save");
    saveGeoJson();
  }, [saveGeoJson]);

  const handleClose = useCallback(() => {
    removeDraw().then(() => {
      setHorizontalLayoutMode(HORIZONTAL_LAYOUT_MODE.STANDARD);
    });
  }, [removeDraw]);

  // TODO disable save button if title is not set or geojsonDraw === initialGeoJson?
  return (
    <div className="vkf-geojson-control-bar-root">
      <div className="control-bar-header">
        <div className="control-bar-title">
          <span className="control-bar-title--static">
            {translate("geojson-control-bar-edit")}:{" "}
          </span>
          <span className="control-bar-title--dynamic">{layerTitle}</span>
        </div>
        <div className="control-bar-layer-buttons">
          <CustomButton
            disabled={!isVectorMapMetadataEditAllowed(vectorMapDraw)}
            className="control-bar-layer-buttons--button layer-metadata-button"
            onClick={handleMetadataPanelClick}
            title={translate("geojson-control-bar-metadata-btn-title")}
          >
            <VkfIcon name="metadata-panel" />
          </CustomButton>
          {vectorMapDraw?.type === "remote" && (
            <CustomButton
              disabled={!isVectorMapHistoryViewAllowed(vectorMapDraw)}
              className="control-bar-layer-buttons--button layer-history-button"
              onClick={handleHistoryClick}
              title={translate("geojson-control-bar-history-btn-title")}
            >
              <VkfIcon name="clock" />
            </CustomButton>
          )}
        </div>
      </div>
      <GeoJsonControlBarContent
        onUpdateViewMode={setViewState}
        viewState={viewState}
        formattedFeatureCount={formattedFeatureCount}
      />

      <div className="control-bar-footer">
        <CustomButton
          className="discard-button"
          onClick={handleClose}
          type="discard"
        >
          <VkfIcon name="discard" />
          {translate("geojson-cancel-btn")}
        </CustomButton>
        <CustomButton
          disabled={viewState === GEOJSON_CONTROL_BAR_VIEW_STATE.NO_TITLE}
          className="save-button"
          onClick={handleSave}
          type="save"
        >
          <VkfIcon name="save" />
          {translate("geojson-save-btn")}
        </CustomButton>
      </div>
    </div>
  );
};

GeoJsonControlBar.propTypes = {};

export default GeoJsonControlBar;
