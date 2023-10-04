/**
 * Created by pouria.rezaei@pikobytes.de on 15.06.2023
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import PropTypes from "prop-types";

import Input from "../../components/InputElement/InputElement.jsx";
import UploadHeader from "../../components/UploadHeader/UploadHeader.jsx";
import UploadFile from "../../components/UploadFile/UploadFile.jsx";
import { translate } from "../../../../util/util.js";
import { formValidations } from "../../utils/inputValidation.js";
import DeleteDialog from "../../components/DeleteDialog/DeleteDialog.jsx";

import {
  createNewMap,
  deleteMapForMapId,
  readMapForMapId,
  updateMap,
} from "../../utils/apiUpload.js";
import {
  getCleanMapMetadata,
  areMetadataPropertiesDistinct,
} from "../../utils/util.js";
import "./UploadMapView.scss";

export default function UploadMapView(props) {
  const { credentials, mapId, mapMetadata, onBack, onRefresh } = props;
  const [file, setFile] = useState(null);
  const [pendingMapId, setPendingMapId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const methods = useForm({
    defaultValues: {
      ...mapMetadata,
      time_of_publication: mapMetadata
        ? mapMetadata.time_of_publication.slice(0, 4)
        : "",
    },
  });

  //
  // Handler section
  //

  // Handle click on the back button
  const handleClickBack = useCallback(() => {
    onBack();
  }, [onBack]);

  // Handle click on the submit button
  const handleClickSubmit = methods.handleSubmit(async (data) => {
    const newMetadata = getCleanMapMetadata(data);

    // Check if the metadata has changed >
    const hasMetadataChanged = areMetadataPropertiesDistinct(
      newMetadata,
      mapMetadata
    );

    if (hasMetadataChanged && file !== null && mapId === null) {
      const newMapId = await createNewMap(
        newMetadata,
        file,
        credentials.username,
        credentials.password
      );

      // Call refresh
      setPendingMapId(newMapId);
      return;
    } else if ((mapId !== null && hasMetadataChanged) || file !== null) {
      const newMapId = await updateMap(
        mapId,
        newMetadata,
        file,
        credentials.username,
        credentials.password
      );

      // Call refresh
      setPendingMapId(newMapId);
      return;
    } else {
      console.log("Currently there are not action to perform.");
    }

    methods.reset();
  });

  // Handle click on the refresh button
  const handleClickRefresh = useCallback(async () => {
    const newMapMetadata = await readMapForMapId(
      pendingMapId || mapId,
      credentials.username,
      credentials.password
    );
    if (newMapMetadata !== null) {
      onRefresh({
        mapId: pendingMapId || mapId,
        metadata: newMapMetadata,
      });
      setPendingMapId(null);
      setFile(null);
    }
  }, [pendingMapId]);

  // Handler which is called, when a map should be deleted
  const handleClickDelete = useCallback(async () => {
    const response = await deleteMapForMapId(
      mapId,
      credentials.username,
      credentials.password
    );

    if (response === true) {
      onBack();
    }
  }, [mapId]);

  // Show delete Modal dialog
  const handleShowDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  //Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
  };

  //Close Modal dialog and delete the selected feature
  const handleConfirmDeleteDialog = () => {
    handleClickDelete().then(() => {
      setShowDeleteDialog(false);
    });
  };

  return (
    <div className="container upload-view">
      <div className="upload-header-container">
        <UploadHeader mapId={mapId || pendingMapId} onBack={handleClickBack} />
        {pendingMapId !== null && (
          <p className="bg-success">{translate("uploadmap-success")}</p>
        )}
      </div>

      <div
        className={`upload-body-container ${
          pendingMapId !== null ? "active" : ""
        }`}
      >
        <FormProvider {...methods}>
          <form
            className="upload-form"
            id="upload-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="left-container">
              <Input {...formValidations.description} />
              <Input {...formValidations.license} />
              <Input {...formValidations.map_type} />
              <Input {...formValidations.map_scale} />
              <Input {...formValidations.measures} />
              <Input {...formValidations.owner} />
              <Input {...formValidations.permalink} />
              <Input {...formValidations.ppn} />
              <Input {...formValidations.technic} />
              <Input {...formValidations.time_of_publication} />
              <Input {...formValidations.allow_download} />
              <Input {...formValidations.title} />
              <Input {...formValidations.title_serie} />
              <Input {...formValidations.title_short} />
              <Input {...formValidations.type} />
            </div>
            <div className="right-container">
              <UploadFile
                mapMetadata={mapMetadata}
                onFileSelect={setFile}
                isPending={file !== null}
              />
              <div className="action-buttons">
                <button
                  className="btn btn-default"
                  type="button"
                  disabled={mapId === null}
                  onClick={handleShowDeleteDialog}
                >
                  {translate("uploadmap-delete-btn")}
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={pendingMapId === null && mapId === null}
                  onClick={handleClickRefresh}
                >
                  Refresh
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleClickSubmit}
                >
                  {translate("uploadmap-save-btn")}
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
      {showDeleteDialog && (
        <DeleteDialog
          show={showDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onDelete={handleConfirmDeleteDialog}
          title={mapMetadata.title}
        />
      )}
    </div>
  );
}

UploadMapView.propTypes = {
  credentials: PropTypes.shape({
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }),
  onBack: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  mapId: PropTypes.oneOfType([PropTypes.string]),
  mapMetadata: PropTypes.object,
};
