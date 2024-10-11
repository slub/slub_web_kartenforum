/**
 * Created by pouria.rezaei@pikobytes.de on 15.06.2023
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import PropTypes from "prop-types";

import Input from "@upload/components/InputElement/InputElement.jsx";
import UploadHeader from "@upload/components/UploadHeader/UploadHeader.jsx";
import UploadFile from "@upload/components/UploadFile/UploadFile.jsx";
import { translate } from "@util/util.js";
import { formValidations } from "@upload/utils/inputValidation.js";
import DeleteDialog from "@upload/components/DeleteDialog/DeleteDialog.jsx";

import {
  createNewMap,
  deleteMapForMapId,
  readMapForMapId,
  updateMap,
} from "@upload/utils/apiUpload.js";
import {
  getCleanMapMetadata,
  areMetadataPropertiesDistinct,
} from "@upload/utils/util.js";
import "./UploadMapView.scss";

export default function UploadMapView(props) {
  const { mapId, mapMetadata, onBack, onRefresh } = props;
  const [file, setFile] = useState(null);
  const [pendingMapId, setPendingMapId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [httpErrorStatusCode, setHttpErrorStatusCode] = useState(null);
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
    setIsLoading(true);

    // Check if the metadata has changed >
    const hasMetadataChanged = areMetadataPropertiesDistinct(
      newMetadata,
      mapMetadata
    );

    if (hasMetadataChanged && file !== null && mapId === null) {
      const response = await createNewMap(newMetadata, file);
      const newMapId = response.data;

      if (newMapId !== null) {
        // Call refresh
        setPendingMapId(newMapId);
      } else {
        setHttpErrorStatusCode(response.httpErrorStatusCode);
      }

      setIsLoading(false);
      return;
    } else if ((mapId !== null && hasMetadataChanged) || file !== null) {
      const response = await updateMap(mapId, newMetadata, file);
      const newMapId = response.data;

      if (newMapId !== null) {
        // Call refresh
        setPendingMapId(newMapId);
      } else {
        setHttpErrorStatusCode(response.httpErrorStatusCode);
      }

      setIsLoading(false);
      return;
    } else {
      console.log("Currently there are not action to perform.");
    }

    methods.reset();
  });

  // Handle click on the refresh button
  const handleClickRefresh = useCallback(async () => {
    const response = await readMapForMapId(pendingMapId || mapId);
    const newMapMetadata = response.data;

    if (newMapMetadata !== null) {
      onRefresh({
        mapId: pendingMapId || mapId,
        metadata: newMapMetadata,
      });
      setPendingMapId(null);
      setFile(null);
      setHttpErrorStatusCode(null);
    } else {
      setHttpErrorStatusCode(response.httpErrorStatusCode);
    }
  }, [pendingMapId]);

  // Handler which is called, when a map should be deleted
  const handleClickDelete = useCallback(async () => {
    const response = await deleteMapForMapId(mapId);

    if (response.data === true) {
      onBack();
    } else {
      setHttpErrorStatusCode(response.httpErrorStatusCode);
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
        {pendingMapId !== null && httpErrorStatusCode === null && (
          <p className="bg-success">{translate("uploadmap-success")}</p>
        )}
        {httpErrorStatusCode !== null && (
          <div className="error-messages">
            {httpErrorStatusCode === 401 && (
              <p className="bg-danger">{translate("common-errors-http-401")}</p>
            )}
            {httpErrorStatusCode === 403 && (
              <p className="bg-danger">{translate("common-errors-http-403")}</p>
            )}
            {httpErrorStatusCode === 404 && (
              <p className="bg-danger">
                {translate("uploadmap-errors-refresh-http-400")}
              </p>
            )}
            {httpErrorStatusCode > 404 && (
              <p className="bg-danger">
                {translate("common-errors-unexpected")}
              </p>
            )}
          </div>
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

              <div>
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
                    className="btn btn-primary has-spinner"
                    type="button"
                    disabled={pendingMapId !== null && mapId === null}
                    title={
                      pendingMapId !== null && mapId === null
                        ? translate("uploadmap-save-btn-disabled-title")
                        : undefined
                    }
                    onClick={handleClickSubmit}
                  >
                    {isLoading === true && (
                      <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
                    )}
                    {translate("uploadmap-save-btn")}
                  </button>
                </div>
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
  onBack: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  mapId: PropTypes.oneOfType([PropTypes.string]),
  mapMetadata: PropTypes.object,
};
