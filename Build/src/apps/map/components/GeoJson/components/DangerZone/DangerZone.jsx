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

const DangerZone = ({ title, onDeleteClick, buttonLabel }) => {
  return (
    <div className="danger-zone-root">
      <p className="header-text geojson-feature-property-label">danger zone</p>

      <div className="delete-button-container">
        <p className="button-header-text">{title}</p>

        <CustomButton
          className="delete-feature-button"
          onClick={onDeleteClick}
          type="delete"
        >
          <VkfIcon name="delete" />
          <p className="delete-button-text geojson-feature-property-label">
            {buttonLabel}
          </p>
        </CustomButton>
      </div>
    </div>
  );
};

DangerZone.propTypes = {
  title: PropTypes.string.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
};

export default DangerZone;
