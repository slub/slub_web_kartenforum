/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import SvgIcons from "@components/SvgIcons";

import "./ToggleSearchButton.scss";

// @TODO: ADD TRANSLATION
export const ToggleSearchButton = ({ onClick }) => {
  return (
    <button
      className="vkf-toggle-search-button"
      onClick={onClick}
      title="toggle search"
    >
      <SvgIcons name="icon-search" />
    </button>
  );
};

ToggleSearchButton.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
};

export default ToggleSearchButton;
