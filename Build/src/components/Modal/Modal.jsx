/**
 * Created by nicolas.looschen@pikobytes.de on 02.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import {
  Modal as BootstrapModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "react-bootstrap";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import "./Modal.scss";

export const Modal = ({
  isOpen,
  onClose,
  modalClassName,
  renderContent,
  renderFooter,
  title,
}) => {
  return (
    <BootstrapModal
      className="vkf-modal"
      onHide={onClose}
      show={isOpen}
      dialogClassName={modalClassName}
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <CustomButton className="close-button" onClick={onClose}>
          <VkfIcon name="close" />
        </CustomButton>
      </ModalHeader>
      <ModalBody>{renderContent()}</ModalBody>
      {renderFooter !== undefined && (
        <ModalFooter>{renderFooter()}</ModalFooter>
      )}
    </BootstrapModal>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  modalClassName: PropTypes.string,
  renderContent: PropTypes.func,
  renderFooter: PropTypes.func,
  title: PropTypes.string,
};

export default Modal;
