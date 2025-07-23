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

const VIEW_STATE = {
  INITIAL: 0,
  DELETE_DIALOG: 1,
};

const DangerZoneMetadataDraw = ({ onDelete }) => {
  const [viewState, setViewState] = useState(VIEW_STATE.INITIAL);
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
      <DeleteDialog
        show={viewState === VIEW_STATE.DELETE_DIALOG}
        onClose={handleCloseDeleteDialog}
        onDelete={handleConfirmDelete}
        description={translate("geojson-metadata-delete-vector")}
      />
    </DangerZoneBase>
  );
};

DangerZoneMetadataDraw.propTypes = {
  onDelete: PropTypes.func.isRequired,
};

export default DangerZoneMetadataDraw;
