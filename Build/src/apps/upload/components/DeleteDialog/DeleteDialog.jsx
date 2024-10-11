/**
 * Created by pouria.rezaei@pikobytes.de on 14/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { Modal, ModalHeader, ModalFooter, ModalBody } from "react-bootstrap";
import PropTypes from "prop-types";
import { translate } from "@util/util.js";
import "./DeleteDialog.scss";

const DeleteDialog = ({ show, onClose, onDelete, title }) => {
  return (
    <Modal show={show} onHide={onClose} className="vkf-delete-dialog">
      <ModalHeader closeButton>{title}</ModalHeader>
      <ModalBody>{translate("deletemodal-body")}</ModalBody>
      <ModalFooter>
        <button className="btn btn-default" type="button" onClick={onClose}>
          {translate("deletemodal-cancel-btn")}
        </button>
        <button className="btn btn-primary" type="button" onClick={onDelete}>
          {translate("deletemodal-delete-btn")}
        </button>
      </ModalFooter>
    </Modal>
  );
};

DeleteDialog.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  title: PropTypes.string,
};
export default DeleteDialog;
