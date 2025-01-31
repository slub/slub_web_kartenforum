/*
 * Created by tom.schulze@pikobytes.de on 12.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";

import CustomButton from "../../../components/CustomButton";
import VkfIcon from "@components/VkfIcon";

import "./VkfPill.scss";

const VkfPill = ({ className, value, onDeleteClick, disabled }) => {
  return (
    <div className={`vkf-pill-root ${className}`}>
      <span className="value">{value} </span>
      {!disabled && (
        <CustomButton
          className="delete-button"
          onClick={() => onDeleteClick(value)}
          disabled={disabled}
        >
          <VkfIcon name="delete" />
        </CustomButton>
      )}
    </div>
  );
};

VkfPill.propTypes = {
  value: PropTypes.string.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default VkfPill;
