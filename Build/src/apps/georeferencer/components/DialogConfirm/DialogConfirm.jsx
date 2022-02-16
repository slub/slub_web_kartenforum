/**
 * Created by jacob.mendt@pikobytes.de on 07.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { translate } from "../../../../util/util";
import "./DialogConfirm.scss";

export const DialogConfirm = (props) => {
  const { onClose, onSubmit } = props;

  const handleOnClose = () => {
    onClose();
  };

  const handleOnSubmit = () => {
    onSubmit();
  };

  return (
    <React.Fragment>
      <Modal className="vkf-dialog-confirm" show={true} onHide={handleOnClose}>
        <Modal.Header>
          <Modal.Title>{translate("georef-dialog-title")}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="dialog-content">
            <p>{translate("georef-dialog-content")}</p>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleOnClose}>
            {translate("georef-dialog-btn-cancel")}
          </Button>
          <Button onClick={handleOnSubmit} bsStyle="primary">
            {translate("georef-dialog-btn-submit")}
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

DialogConfirm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DialogConfirm;
