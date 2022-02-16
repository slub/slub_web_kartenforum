/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

import "./ToggleResultListButton.scss";

export const ToggleResultListButton = ({ disabled, onClick, isOpen }) => {
  return (
    <div
      className={clsx(
        "vkf-toggle-search-result-list",
        isOpen ? "open" : "closed",
        disabled && "disabled"
      )}
    >
      <button disabled={disabled} onClick={onClick} />
    </div>
  );
};

ToggleResultListButton.propTypes = {
  disabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
};

export default ToggleResultListButton;
