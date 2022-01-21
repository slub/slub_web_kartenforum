/**
 * Created by nicolas.looschen@pikobytes.de on 04.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { ControlLabel, FormGroup, FormControl } from "react-bootstrap";

import { isDefined, translate } from "../../../../../../util/util";

import "./DialogAddGeoJson.scss";

export const DialogAddGeoJson = ({ initialName, onClose, onSubmit }) => {
  const refTitleInput = useRef();

  const handleOnClose = () => {
    onClose();
  };

  const handleOnSubmit = () => {
    const title = isDefined(refTitleInput.current)
      ? refTitleInput.current.value
      : undefined;

    onSubmit(title, "EPSG:4326");
  };

  return (
    <div>
      <Modal
        className="vkf-dialog-add-geojson"
        onHide={handleOnClose}
        show={true}
      >
        <Modal.Header>
          <Modal.Title>{translate("geojson-adddialog-title")}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="dialog-content">
            <form>
              <FormGroup>
                <ControlLabel>
                  {translate("geojson-adddialog-layer-title-label")}
                </ControlLabel>
                <FormControl
                  defaultValue={initialName ?? "Unknown"}
                  inputRef={refTitleInput}
                  name="title"
                  type="text"
                />
              </FormGroup>
            </form>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleOnClose}>
            {translate("geojson-adddialog-cancel")}
          </Button>
          <Button onClick={handleOnSubmit} bsStyle="primary">
            {translate("geojson-adddialog-confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

DialogAddGeoJson.propTypes = {
  initialName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DialogAddGeoJson;
