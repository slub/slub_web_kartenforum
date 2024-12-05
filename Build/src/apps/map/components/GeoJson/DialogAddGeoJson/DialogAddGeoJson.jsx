/**
 * Created by nicolas.looschen@pikobytes.de on 04.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect } from "react";
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "react-bootstrap";
import PropTypes from "prop-types";
import { useRecoilState } from "recoil";
import { addedFileState } from "@map/atoms";

import { useAddGeoJson } from "@map/components/GeoJson/util/hooks/useAddGeoJson";
import ToggleSwitch from "@map/components/ToggleSwitch/ToggleSwitch";
import { translate } from "@util/util";
import { isVectorMapCreateAllowed } from "@map/components/GeoJson/util/authorization";

import "./DialogAddGeoJson.scss";

const TOGGLE_SWITCH_ID = "persistGeoJson";

const DialogAddGeoJsonBase = ({ initialName, onClose, onSubmit }) => {
  const handleOnSubmit = useCallback((event) => {
    const formData = new FormData(event.currentTarget);
    event.preventDefault();

    const title = formData.get("title");
    const persistGeoJson = formData.get("persistGeoJson") === "on";

    onSubmit(title, persistGeoJson);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      const submitButton = document.getElementById("submit-add-geojson-form");
      submitButton.click();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div>
      <Modal className="vkf-dialog-add-geojson" onHide={onClose} show={true}>
        <ModalHeader>
          <ModalTitle>{translate("geojson-adddialog-title")}</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div className="dialog-content">
            <form id="add-geojson-form" onSubmit={handleOnSubmit}>
              <FormGroup>
                <ControlLabel>
                  {translate("geojson-adddialog-layer-title-label")}
                </ControlLabel>
                <FormControl
                  autoFocus
                  defaultValue={initialName ?? "Unknown"}
                  name="title"
                  type="text"
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel
                  className="switch-label"
                  htmlFor={TOGGLE_SWITCH_ID}
                >
                  <ToggleSwitch
                    disabled={!isVectorMapCreateAllowed()}
                    id={TOGGLE_SWITCH_ID}
                  />
                  Persistente Vektor-Karte
                </ControlLabel>
                <div>
                  Wählen ob die hinaufgeladenen Daten dauerhaft als
                  recherchierbare Karte verfügbar sein soll oder lediglich
                  temporär für Sie persönlich in Ihrem Browser.
                </div>
              </FormGroup>
            </form>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>
            {translate("geojson-adddialog-cancel")}
          </Button>
          <Button
            id="submit-add-geojson-form"
            type="submit"
            form="add-geojson-form"
            bsStyle="primary"
          >
            {translate("geojson-adddialog-confirm")}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

DialogAddGeoJsonBase.propTypes = {
  initialName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const DialogAddGeoJson = () => {
  const [addedFile, setAddedFile] = useRecoilState(addedFileState);

  const addGeoJson = useAddGeoJson();

  const handleClose = useCallback(() => {
    setAddedFile(null);
  }, []);

  const handleSubmit = useCallback(
    (title, shouldPersist) => {
      // add geojson according to passed parameters, afterward cleanup file state (either layer or to draw view)
      addGeoJson(title, addedFile.content, shouldPersist).then(() => {
        setAddedFile(null);
      });
    },
    [addGeoJson, addedFile]
  );

  return addedFile ? (
    <DialogAddGeoJsonBase
      onClose={handleClose}
      onSubmit={handleSubmit}
      initialName={addedFile.name}
    />
  ) : null;
};

export default DialogAddGeoJson;
