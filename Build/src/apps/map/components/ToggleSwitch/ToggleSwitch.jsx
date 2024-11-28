/**
 * Created by nicolas.looschen@pikobytes.de on 27.11.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";

import "./ToggleSwitch.scss";
import PropTypes from "prop-types";

export const ToggleSwitch = ({ id }) => {
  return (
    <span className="toggle-switch">
      <input className="toggle__input" name={id} type="checkbox" id={id} />
      <div className="toggle__fill" />
    </span>
  );
};

ToggleSwitch.propTypes = {
  id: PropTypes.string.isRequired,
};

export default ToggleSwitch;
