/**
 * Created by nicolas.looschen@pikobytes.de on 04.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useRef } from "react";
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

import { isDefined, translate } from "@util/util";

import { useRecoilState } from "recoil";
import { addedFileState } from "@map/atoms";

import "./DialogAddGeoJson.scss";
import { useAddGeoJson } from "@map/components/GeoJson/util/useAddGeoJson";

const DialogAddGeoJsonBase = ({ initialName, onClose, onSubmit }) => {
  const refTitleInput = useRef();

  const handleOnSubmit = () => {
    const title = isDefined(refTitleInput.current)
      ? refTitleInput.current.value
      : undefined;

    onSubmit(title);
  };

  return (
    <div>
      <Modal className="vkf-dialog-add-geojson" onHide={onClose} show={true}>
        <ModalHeader>
          <ModalTitle>{translate("geojson-adddialog-title")}</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div className="dialog-content">
            <form>
              <FormGroup>
                <ControlLabel>
                  {translate("geojson-adddialog-layer-title-label")}
                </ControlLabel>
                <FormControl
                  autoFocus
                  defaultValue={initialName ?? "Unknown"}
                  inputRef={(ref) => {
                    refTitleInput.current = ref;
                  }}
                  name="title"
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleOnSubmit();
                    }
                  }}
                />
              </FormGroup>
            </form>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>
            {translate("geojson-adddialog-cancel")}
          </Button>
          <Button onClick={handleOnSubmit} bsStyle="primary">
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

  const addGeoJsonLayer = useAddGeoJson();

  const handleClose = useCallback(() => {
    setAddedFile(null);
  }, []);

  const handleSubmit = useCallback(
    (title) => {
      addGeoJsonLayer(title, addedFile.content, true).then(setAddedFile(null));
    },
    [addGeoJsonLayer]
  );

  return addedFile ? (
    <DialogAddGeoJsonBase
      onClose={handleClose}
      onSubmit={handleSubmit}
      // onSubmit={addGeoJsonLayer}
      initialName={addedFile.name}
    />
  ) : null;
};

export default DialogAddGeoJson;
