/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo, useState } from "react";
import { useSetRecoilState, useRecoilState, useRecoilValue } from "recoil";

import VkfIcon from "@components/VkfIcon";
import { translate, isDefined } from "@util/util";
import {
  drawModePanelState,
  metadataDrawState,
  vectorMapDrawState,
} from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";

import DeleteDialog from "../GeoJsonFeatureEditPanel/DeleteDialog";
import { VECTOR_MAP_TYPES } from "../constants";
import useDeleteGeojson from "../util/hooks/useDeleteGeoJson";
import DangerZone from "../components/DangerZone";
import GeoJsonPanelHeader from "../GeoJsonPanelHeader";
import CustomButton from "../components/CustomButton";

import GeoJsonMetadataForm from "./GeoJsonMetadataForm";

import "./GeoJsonMetadataPanel.scss";

const FORM_ID = "vkf-geojson-metadata-form";

const VIEW_STATE = {
  INITIAL: 0,
  DELETE_DIALOG: 1,
};

const MetadataPanel = () => {
  const setDrawModePanel = useSetRecoilState(drawModePanelState);
  const [metadataDraw, setMetadataDraw] = useRecoilState(metadataDrawState);
  const vectorMapDraw = useRecoilValue(vectorMapDrawState);
  const deleteGeoJson = useDeleteGeojson();

  const [viewState, setViewState] = useState(VIEW_STATE.INITIAL);

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

  const isUnsavedRemoteVectorMap = useMemo(() => {
    if (!isDefined(vectorMapDraw)) {
      return false;
    }

    const { type, id } = vectorMapDraw;

    return type === VECTOR_MAP_TYPES.REMOTE && !isDefined(id);
  }, [vectorMapDraw]);

  const handleCloseDeleteDialog = useCallback(() => {
    setViewState(VIEW_STATE.INITIAL);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteGeoJson();
  }, [deleteGeoJson]);

  const handleDeleteClick = useCallback(() => {
    if (viewState !== VIEW_STATE.DELETE_DIALOG) {
      setViewState(VIEW_STATE.DELETE_DIALOG);
    }
  }, [viewState]);

  const handleCloseClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.NONE);
  }, []);

  const handleValidatedFormSubmit = useCallback((data) => {
    setMetadataDraw(data);
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
            data={metadataDraw}
            onValidatedFormSubmit={handleValidatedFormSubmit}
          />
        </div>
        {!isUnsavedRemoteVectorMap && (
          <div className="danger-zone-container">
            <DangerZone
              description={translate("geojson-metadata-panel-delete")}
              onDeleteClick={handleDeleteClick}
              buttonLabel={translate("geojson-metadata-panel-delete-btn")}
            />
          </div>
        )}
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
      <DeleteDialog
        show={viewState === VIEW_STATE.DELETE_DIALOG}
        onClose={handleCloseDeleteDialog}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
};

MetadataPanel.propTypes = {};

export default MetadataPanel;
