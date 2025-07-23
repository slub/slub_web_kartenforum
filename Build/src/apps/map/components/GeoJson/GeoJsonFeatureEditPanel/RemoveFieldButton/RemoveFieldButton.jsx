/*
 * Created by tom.schulze@pikobytes.de on 23.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import CustomButton from "../../components/CustomButton";
import { translate } from "@util/util";
import VkfIcon from "@components/VkfIcon";
import PropTypes from "prop-types";

import "./RemoveFieldButton.scss";

const RemoveFieldButton = ({ onClick }) => {
  return (
    <CustomButton
      className="remove-field-button"
      type="discard"
      onClick={onClick}
    >
      <p>{translate("geojson-featureview-delete-field-btn")}</p>
      <VkfIcon name="delete" />
    </CustomButton>
  );
};

RemoveFieldButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default RemoveFieldButton;
