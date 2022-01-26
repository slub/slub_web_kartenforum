/**
 * Created by nicolas.looschen@pikobytes.de on 26.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

import "./DragButton.scss";

export const DragButton = ({ active, ...rest }) => {
  return (
    <button className={clsx("vkf-drag-button", active && "active")} {...rest}>
      <span />
      <span />
      <span />
      <span />
    </button>
  );
};

DragButton.propTypes = {
  active: PropTypes.bool,
};

export default DragButton;
