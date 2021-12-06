/**
 * Created by nicolas.looschen@pikobytes.de on 02.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Modal as BootstrapModal } from "react-bootstrap";

export const Modal = ({
  isOpen,
  onClose,
  modalClassName,
  renderContent,
  title,
}) => {
  return (
    <BootstrapModal
      onHide={onClose}
      show={isOpen}
      dialogClassName={modalClassName}
    >
      <BootstrapModal.Header>
        <p>{title}</p>
        <button onClick={onClose}>X</button>
      </BootstrapModal.Header>
      <BootstrapModal.Body className={clsx("modal-content", modalClassName)}>
        {renderContent()}
      </BootstrapModal.Body>
    </BootstrapModal>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  modalClassName: PropTypes.string,
  renderContent: PropTypes.func,
  title: PropTypes.string,
};

export default Modal;
