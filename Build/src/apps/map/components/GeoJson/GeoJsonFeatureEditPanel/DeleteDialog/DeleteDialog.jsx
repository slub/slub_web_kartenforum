/**
 * Created by pouria.rezaei@pikobytes.de on 14/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { Modal, ModalHeader, ModalFooter, ModalBody } from "react-bootstrap";
import PropTypes from "prop-types";
import { translate } from "@util/util";
import CustomButton from "@map/components/GeoJson/components/CustomButton/CustomButton";
import VkfIcon from "@components/VkfIcon";

import "./DeleteDialog.scss";

const DeleteDialog = ({ show, onClose, onDelete }) => {
  return (
    <Modal show={show} onHide={onClose} className="vkf-delete-dialog">
      <ModalHeader closeButton></ModalHeader>
      <ModalBody>{translate("geojson-deletemodal-body")}</ModalBody>
      <ModalFooter>
        <CustomButton className="delete-btn" onClick={onDelete} type="delete">
          <VkfIcon name="delete" />
          <p>{translate("geojson-deletemodal-delete-btn")}</p>
        </CustomButton>
        <CustomButton className="cancel-btn" onClick={onClose} type="discard">
          <VkfIcon name="discard" />
          {translate("geojson-featureview-cancel-btn")}
        </CustomButton>
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
