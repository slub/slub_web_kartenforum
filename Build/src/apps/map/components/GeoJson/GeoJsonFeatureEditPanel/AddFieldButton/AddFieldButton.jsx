/*
 * Created by tom.schulze@pikobytes.de on 23.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import CustomButton from "../../components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import { translate } from "@util/util";
import PropTypes from "prop-types";

import "./AddFieldButton.scss";

const AddFieldButton = ({ onClick }) => {
  return (
    <div className="add-field-button-root">
      <CustomButton
        className="add-field-button"
        buttonType="button"
        onClick={onClick}
      >
        <VkfIcon name="add" />
        <p className="add-field-button-text">
          {translate("geojson-editfeature-add-new-field-button")}
        </p>
      </CustomButton>
    </div>
  );
};

AddFieldButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default AddFieldButton;
