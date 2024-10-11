/**
 * Created by pouria.rezaei@pikobytes.de on 14/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { Modal, ModalHeader, ModalFooter, ModalBody } from "react-bootstrap";
import PropTypes from "prop-types";
import { translate } from "../../../../../../util/util.js";
import Button from "../../../Buttons/Button.jsx";
import "./DeleteDialog.scss";

const DeleteDialog = ({ show, onClose, onDelete }) => {
  return (
    <Modal show={show} onHide={onClose} className="vkf-delete-dialog">
      <ModalHeader closeButton></ModalHeader>
      <ModalBody>{translate("geojson-deletemodal-body")}</ModalBody>
      <ModalFooter>
        <Button className="delete-btn" onClick={onDelete} type="primary">
          {translate("geojson-deletemodal-delete-btn")}
        </Button>
        <Button className="cancel-btn" onClick={onClose} type="default">
          {translate("geojson-featureview-cancel-btn")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

DeleteDialog.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
};
export default DeleteDialog;
