/**
 * Created by pouria.rezaei@pikobytes.de on 14/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import { translate } from "@util/util";
import CustomButton from "@map/components/GeoJson/components/CustomButton/CustomButton";
import VkfIcon from "@components/VkfIcon";
import Modal from "@components/Modal";

import "./DeleteDialog.scss";

const DeleteDialog = ({ show, onClose, onDelete, description }) => {
  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={translate("geojson-deletemodal-title")}
      renderContent={() => (
        <>
          <p>{description}</p>
          <div className="delete-feature-modal-buttons">
            <CustomButton
              className="delete-btn"
              onClick={onDelete}
              type="delete"
            >
              <VkfIcon name="delete" />
              {translate("geojson-deletemodal-delete-btn")}
            </CustomButton>
            <CustomButton
              className="cancel-btn"
              onClick={onClose}
              type="discard"
            >
              <VkfIcon name="discard" />
              {translate("geojson-cancel-btn")}
            </CustomButton>
          </div>
        </>
      )}
      modalClassName="vkf-delete-dialog"
    />
  );
};

DeleteDialog.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  description: PropTypes.string,
};
export default DeleteDialog;
