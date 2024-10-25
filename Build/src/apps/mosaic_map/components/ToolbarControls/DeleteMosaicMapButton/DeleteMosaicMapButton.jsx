/**
 * Created by nicolas.looschen@pikobytes.de on 01.07.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Button, Glyphicon } from "react-bootstrap";

import ControlButton from "@georeferencer/components/ControlButton";
import { translate } from "@util/util.js";
import {
  mosaicMapLoadingState,
  MosaicMapLoadingStates,
  mosaicMapSelectedLayersState,
  mosaicMapSelectedMosaicMapState,
} from "@mosaic-map/atoms";
import Modal from "@components/Modal";
import { VALUE_CREATE_NEW_MAP } from "@mosaic-map/components/MosaicMapSelectorDropdown/MosaicMapSelectorDropdown.jsx";
import { deleteMosaicMap } from "@util/apiMosaicMaps.js";
import { notificationState } from "@atoms";
import { mapState } from "@map/atoms";

import "./DeleteMosaicMapButton.scss";
import { resetMosaicOverlaySource } from "@mosaic-map/components/MosaicMapOverlayLayer/MosaicMapOverlayLayer.jsx";

export const SaveMosaicMapButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMosaicMap, setSelectedMosaicMap] = useRecoilState(
    mosaicMapSelectedMosaicMapState
  );
  const setLoadingState = useSetRecoilState(mosaicMapLoadingState);
  const setNotification = useSetRecoilState(notificationState);
  const setSelectedMosaicLayers = useSetRecoilState(
    mosaicMapSelectedLayersState
  );
  const map = useRecoilValue(mapState);

  const handleDeleteMosaicMap = () => {
    deleteMosaicMap(selectedMosaicMap.id)
      .then(() => {
        handleCloseModal();
        setSelectedMosaicMap({ id: VALUE_CREATE_NEW_MAP });
        setSelectedMosaicLayers([]);
        resetMosaicOverlaySource(map);
        // trigger reload of list
        setLoadingState(MosaicMapLoadingStates.DOWNLOADING_LIST);
        setNotification({
          id: "mosaic-map-delete-button",
          type: "success",
          text: translate("mosaic-map-success-messages-delete"),
        });
      })
      .catch(() => {
        handleCloseModal();
        setNotification({
          id: "mosaic-map-delete-button",
          type: "danger",
          text: translate("mosaic-map-error-messages-delete-failed"),
        });
      });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Modal
        bs
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={translate("mosaic-map-delete-modal-title")}
        renderContent={() => {
          return (
            <div className="vkf-modal-description-container">
              <p>{translate("mosaic-map-delete-modal-content")}</p>
            </div>
          );
        }}
        renderFooter={() => {
          return (
            <>
              <Button
                bsStyle="warning"
                bsSize="large"
                onClick={handleCloseModal}
              >
                {translate("mosaic-map-delete-modal-buttonCancel")}
              </Button>
              <Button
                bsStyle="danger"
                bsSize="large"
                onClick={handleDeleteMosaicMap}
              >
                {translate("mosaic-map-delete-modal-buttonDelete")}
              </Button>
            </>
          );
        }}
      />
      <ControlButton
        className="delete-mosaic-map-button"
        disabled={selectedMosaicMap.id === VALUE_CREATE_NEW_MAP}
        id="delete-mosaic-map"
        iconClassName="trash"
        IconComponent={Glyphicon}
        onClick={handleOpenModal}
        title={translate("mosaic-maps-delete")}
      />
    </>
  );
};

export default SaveMosaicMapButton;
