/**
 * Created by nicolas.looschen@pikobytes.de on 30.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Button } from "react-bootstrap";

import { postMosaicMap } from "../../../../../util/apiMosaicMaps.js";
import ControlButton from "../../../../georeferencer/components/ControlButton/ControlButton.jsx";
import { translate } from "../../../../../util/util.js";
import {
  mosaicMapLoadingState,
  MosaicMapLoadingStates,
  mosaicMapSelectedMosaicMapState,
} from "../../../atoms/atoms.js";
import { notificationState } from "../../../../../atoms/atoms.js";
import Modal from "../../../../../components/Modal/Modal.jsx";
import { VALUE_CREATE_NEW_MAP } from "../../MosaicMapSelectorDropdown/MosaicMapSelectorDropdown.jsx";
import {
  useSavedState,
  SaveStates,
} from "../../MosaicMapInputPanel/components/SaveIndicator/SaveIndicator.jsx";

import "./SaveMosaicMapButton.scss";

// "name", "raw_map_ids", "title", "title_short", "time_of_publication", "link_thumb", "map_scale"

const validateArray = (array) => {
  return array !== undefined && array.length > 0;
};

const validateNumber = (number) => {
  return Number.isSafeInteger(number);
};

const validateString = (string) => {
  return string !== undefined && string.length > 0;
};

export const isMapValid = (newMap) => {
  const {
    name,
    raw_map_ids,
    title,
    title_short,
    time_of_publication,
    link_thumb,
    map_scale,
  } = newMap;

  return (
    validateString(name) &&
    validateArray(raw_map_ids) &&
    validateString(title) &&
    validateString(title_short) &&
    validateNumber(time_of_publication) &&
    validateString(link_thumb) &&
    validateNumber(map_scale)
  );
};

export const SaveMosaicMapButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingState, setLoadingState] = useRecoilState(mosaicMapLoadingState);
  const setNotifcation = useSetRecoilState(notificationState);
  const [selectedMosaicMap, setSelectedMosaicMap] = useRecoilState(
    mosaicMapSelectedMosaicMapState
  );
  const savedState = useSavedState();

  const isUpdate = selectedMosaicMap.id !== VALUE_CREATE_NEW_MAP;

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSaveMosaicMap = () => {
    if (selectedMosaicMap !== undefined) {
      setLoadingState(MosaicMapLoadingStates.UPLOADING_CHANGES);
      postMosaicMap(selectedMosaicMap)
        .then((res) => {
          setLoadingState(MosaicMapLoadingStates.DOWNLOADING_LIST);
          setSelectedMosaicMap({
            ...res,
            raw_map_ids: selectedMosaicMap.raw_map_ids,
          });
          setNotifcation({
            id: "mosaic-map-save-button",
            type: "success",
            text: translate("mosaic-map-success-messages-saved"),
          });
        })
        .catch((error) => {
          console.error(error);
          setNotifcation({
            id: "mosaic-map-save-button",
            type: "danger",
            text: translate("mosaic-map-error-messages-failed-upload"),
          });
        })
        .finally(() => {
          handleCloseModal();
        });
    }
  };

  return (
    <>
      <Modal
        bs
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={translate("mosaic-map-save-modal-title")}
        renderContent={() => {
          return (
            <div className="vkf-modal-description-container">
              <p>{translate("mosaic-map-save-modal-content")}</p>
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
                bsStyle="success"
                bsSize="large"
                onClick={handleSaveMosaicMap}
              >
                {translate("mosaic-map-save-modal-buttonSave")}
              </Button>
            </>
          );
        }}
      />
      <ControlButton
        disabled={
          !isMapValid(selectedMosaicMap) ||
          loadingState === MosaicMapLoadingStates.UPLOADING_CHANGES ||
          (isUpdate && savedState !== SaveStates.CHANGED)
        }
        id="save-mosaic-map"
        iconClassName="icon-save"
        onClick={isUpdate ? handleOpenModal : handleSaveMosaicMap}
        title={translate("mosaic-maps-save")}
      />
    </>
  );
};

export default SaveMosaicMapButton;
