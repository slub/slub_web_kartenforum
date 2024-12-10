/*
 * Created by tom.schulze@pikobytes.de on 22.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import {
  drawModePanelState,
  horizontalLayoutModeState,
  initialGeoJsonDrawState,
  metadataDrawState,
  vectorMapDrawState,
} from "@map/atoms";
import { isDefined, translate } from "@util/util";

import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import useSaveGeoJson from "@map/components/GeoJson/util/hooks/useSaveGeoJson";
import { isVectorMapMetadataEditAllowed } from "@map/components/GeoJson/util/authorization";

import {
  DRAW_MODE_PANEL_STATE,
  HORIZONTAL_LAYOUT_MODE,
} from "@map/layouts/util";
import { useMapboxDrawInitializers } from "@map/components/GeoJson/MapboxDrawLoader/MapboxDrawLoader";
import { METADATA } from "@map/components/CustomLayers";
import GeoJsonControlBarContent from "@map/components/GeoJson/GeoJsonControlBar/components/GeoJsonControlBarContent";
import { useGeoJsonFeatureDraw } from "../GeoJsonFeatureDrawLoader";
import GeoJsonControlBarHistoryButton from "@map/components/GeoJson/GeoJsonControlBar/components/GeoJsonControlBarHistoryButton";
import CloseDrawingModeModal from "@map/components/GeoJson/GeoJsonControlBar/components/CloseDrawingModeModal.jsx";
import "./GeoJsonControlBar.scss";

export const GEOJSON_CONTROL_BAR_VIEW_STATE = {
  INITIAL: 0,
  SHOW_FEATURE_COUNT: 1,
  NO_TITLE: 2,
  NO_FEATURES: 3,
  UNSAVED_FEATURE_CHANGES: 4,
};

const GeoJsonControlBar = () => {
  const setHorizontalLayoutMode = useSetRecoilState(horizontalLayoutModeState);
  const setDrawModePanel = useSetRecoilState(drawModePanelState);
  const { removeDraw } = useMapboxDrawInitializers();
  const saveGeoJson = useSaveGeoJson();
  const { resetFeaturePreview } = useGeoJsonFeatureDraw();
  const vectorMapDraw = useRecoilValue(vectorMapDrawState);
  const metadataDraw = useRecoilValue(metadataDrawState);
  const initialGeoJson = useRecoilValue(initialGeoJsonDrawState);

  const [viewState, setViewState] = useState(
    GEOJSON_CONTROL_BAR_VIEW_STATE.INITIAL
  );
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  if (viewState === GEOJSON_CONTROL_BAR_VIEW_STATE.INITIAL) {
    if (!isDefined(metadataDraw[METADATA.title])) {
      setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.NO_TITLE);
    } else {
      if (initialGeoJson.features.length === 0) {
        setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.NO_FEATURES);
      } else {
        setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT);
      }
    }
  } else if (viewState === GEOJSON_CONTROL_BAR_VIEW_STATE.NO_TITLE) {
    if (isDefined(metadataDraw[METADATA.title])) {
      if (initialGeoJson.features.length === 0) {
        setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.NO_FEATURES);
      } else {
        setViewState(GEOJSON_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT);
      }
    }
  }

  const formattedLayerTitle = useMemo(() => {
    const title = metadataDraw[METADATA.title] ?? "";

    if (title === "") {
      return `[${translate("geojson-featureview-no-title")}]`;
    }

    return title;
  }, [metadataDraw[METADATA.title]]);

  const isValidLayerTitle = useMemo(() => {
    return (
      isDefined(metadataDraw[METADATA.title]) &&
      metadataDraw[METADATA.title] !== ""
    );
  }, [metadataDraw[METADATA.title]]);

  const formattedFeatureCount = useMemo(() => {
    const featureCount = initialGeoJson.features.length;
    if (featureCount > 1) {
      return `${featureCount} ${translate(
        "geojson-control-bar-feature-plural"
      )}`;
    }

    if (featureCount === 1) {
      return `1 ${translate("geojson-control-bar-feature")}`;
    }

    return `${translate("geojson-control-bar-no-features")}`;
  }, [initialGeoJson]);

  const handleMetadataPanelClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.METADATA);
  }, []);

  const handleHistoryClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.HISTORY);
  }, []);

  const handleSave = useCallback(() => {
    resetFeaturePreview();
    saveGeoJson();
  }, [resetFeaturePreview, saveGeoJson]);

  const handleClose = useCallback(() => {
    removeDraw().then(() => {
      setHorizontalLayoutMode(HORIZONTAL_LAYOUT_MODE.STANDARD);
    });
    setShowDiscardModal(false);
  }, [removeDraw]);

  const toggleDiscardDialog = useCallback(() => {
    setShowDiscardModal((prev) => !prev);
  }, []);

  return (
    <div className="vkf-geojson-control-bar-root">
      <div className="control-bar-header">
        <div className="control-bar-title">
          <span className="control-bar-title--static">
            {translate("geojson-control-bar-edit")}:{" "}
          </span>
          <span className="control-bar-title--dynamic">
            {formattedLayerTitle}
          </span>
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
          <GeoJsonControlBarHistoryButton onClick={handleHistoryClick} />
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
          onClick={toggleDiscardDialog}
          type="discard"
        >
          <VkfIcon name="discard" />
          {translate("geojson-cancel-btn")}
        </CustomButton>
        <CustomButton
          disabled={!isValidLayerTitle}
          className="save-button"
          onClick={handleSave}
          type="save"
        >
          <VkfIcon name="save" />
          {translate("geojson-save-btn")}
        </CustomButton>
      </div>
      {showDiscardModal && (
        <CloseDrawingModeModal
          show={showDiscardModal}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

GeoJsonControlBar.propTypes = {};

export default GeoJsonControlBar;
