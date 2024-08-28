/**
 * Created by thomas@jung.digital on 13.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";
import SettingsProvider from "../../SettingsProvider.js";

const SvgIcons = ({ name, color, size }) => (
  <svg
    viewBox="0 0 24 24"
    className={`icon ${name}`}
    fill={color}
    width={size}
    height={size}
  >
    <use xlinkHref={`${SettingsProvider.getSettings().ICON_SPRITE}#${name}`} />
  </svg>
);

SvgIcons.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  size: PropTypes.number,
};

export default SvgIcons;
