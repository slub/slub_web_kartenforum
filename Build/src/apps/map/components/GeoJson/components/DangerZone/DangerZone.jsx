/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";

import VkfIcon from "@components/VkfIcon";
import CustomButton from "../CustomButton";

import "./DangerZone.scss";

const DangerZone = ({ description, onDeleteClick, buttonLabel }) => {
  return (
    <div className="danger-zone-root">
      <p className="text text-header">danger zone</p>

      <div className="danger-zone-content">
        <p className="text text-description">{description}</p>

        <CustomButton
          className="delete-button"
          onClick={onDeleteClick}
          type="delete"
        >
          <VkfIcon name="delete" />
          <p className="text text-button">{buttonLabel}</p>
        </CustomButton>
      </div>
    </div>
  );
};

DangerZone.propTypes = {
  description: PropTypes.string.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
};

export default DangerZone;
