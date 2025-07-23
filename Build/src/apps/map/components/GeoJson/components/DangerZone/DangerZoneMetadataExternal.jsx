/*
 * Created by tom.schulze@pikobytes.de on 13.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useState } from "react";
import DangerZoneBase from "./DangerZoneBase";
import DeleteDialog from "../../GeoJsonFeatureEditPanel/DeleteDialog";
import CustomButton from "../CustomButton";
import VkfIcon from "@components/VkfIcon";
import { translate } from "@util/util";
import PropTypes from "prop-types";

import "./DangerZoneMetaDataExternal.scss";

const VIEW_STATE = {
  INITIAL: 0,
  DELETE_DIALOG: 1,
};

const DangerZoneMetadataExternal = ({ onDelete, onRefresh }) => {
  const [loading, setLoadingState] = useState(false);
  const [viewState, setViewState] = useState(VIEW_STATE.INITIAL);

  const handleRefreshClick = useCallback(async () => {
    setLoadingState(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error(error);
    }

    setLoadingState(false);
  }, [onRefresh]);

  const handleDeleteClick = useCallback(() => {
    if (viewState !== VIEW_STATE.DELETE_DIALOG) {
      setViewState(VIEW_STATE.DELETE_DIALOG);
    }
  }, [viewState]);

  const handleCloseDeleteDialog = useCallback(() => {
    setViewState(VIEW_STATE.INITIAL);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  return (
    <DangerZoneBase>
      <div className="metadata-external-container">
        <div>
          <p className="text text-description">
            {translate("geojson-metadata-panel-refresh")}
          </p>
          <CustomButton
            className="refresh-button"
            onClick={handleRefreshClick}
            type="primary"
            loading={loading}
          >
            <p className="text text-button">
              {translate("geojson-metadata-panel-refresh-btn")}
            </p>
          </CustomButton>
        </div>
        <div>
          <p className="text text-description">
            {translate("geojson-metadata-panel-delete")}
          </p>

          <CustomButton
            className="delete-button"
            onClick={handleDeleteClick}
            type="delete"
          >
            <VkfIcon name="delete" />
            <p className="text text-button">
              {translate("geojson-metadata-panel-delete-btn")}
            </p>
          </CustomButton>
        </div>
      </div>
      <DeleteDialog
        show={viewState === VIEW_STATE.DELETE_DIALOG}
        onClose={handleCloseDeleteDialog}
        onDelete={handleConfirmDelete}
        description={translate("geojson-metadata-delete-vector")}
      />
    </DangerZoneBase>
  );
};

DangerZoneMetadataExternal.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default DangerZoneMetadataExternal;
