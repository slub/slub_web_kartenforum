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
import GeoJsonControlBarContent from "./components/GeoJsonControlBarContent";
import GeoJsonControlBarHistoryButton from "./components/GeoJsonControlBarHistoryButton";
import GeoJsonControlBarRolesButton from "./components/GeoJsonControlBarRolesButton";
import { useGeoJsonFeatureDraw } from "../GeoJsonFeatureDrawLoader";
import CloseDrawingModeModal from "@map/components/GeoJson/GeoJsonControlBar/components/CloseDrawingModeModal";
import DialogRoles from "@map/components/GeoJson/GeoJsonRoles";

import "./GeoJsonControlBar.scss";

export const GEOJSON_CONTROL_BAR_VIEW_STATE = {
  INITIAL: 0,
  SHOW_FEATURE_COUNT: 1,
  NO_TITLE: 2,
  NO_FEATURES: 3,
  UNSAVED_FEATURE_CHANGES: 4,
};

const MODAL_STATE = {
  NONE: 0,
  ROLES: 1,
  DISCARD: 2,
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
  const [modalState, setModalState] = useState(MODAL_STATE.NONE);

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

  const handleRolesClick = useCallback(() => {
    setModalState(MODAL_STATE.ROLES);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(MODAL_STATE.NONE);
  }, []);

  const handleSave = useCallback(() => {
    resetFeaturePreview();
    saveGeoJson();
  }, [resetFeaturePreview, saveGeoJson]);

  const handleDiscard = useCallback(() => {
    removeDraw().then(() => {
      setHorizontalLayoutMode(HORIZONTAL_LAYOUT_MODE.STANDARD);
    });
    handleModalClose();
  }, [removeDraw]);

  const handleDiscardClick = useCallback(() => {
    setModalState(MODAL_STATE.DISCARD);
  }, []);

  return (
    <div className="vkf-geojson-control-bar-root">
      <div className="control-bar-header">
        <div className="control-bar-title">{formattedLayerTitle}</div>
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
          <GeoJsonControlBarRolesButton onClick={handleRolesClick} />
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
          onClick={handleDiscardClick}
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
      <CloseDrawingModeModal
        show={modalState === MODAL_STATE.DISCARD}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onClose={handleModalClose}
      />
      <DialogRoles
        show={modalState === MODAL_STATE.ROLES}
        onClose={handleModalClose}
      />
    </div>
  );
};

GeoJsonControlBar.propTypes = {};

export default GeoJsonControlBar;
