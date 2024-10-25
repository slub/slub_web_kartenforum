/**
 * Created by jacob.mendt@pikobytes.de on 16.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

import SvgIcons from "@components/SvgIcons";
import "./ControlButton.scss";

export const ControlButton = (props) => {
  const {
    activeControl = null,
    className = "",
    disabled = false,
    iconClassName = "",
    IconComponent,
    id = "unknown",
    onClick,
    title = "unknown",
  } = props;

  // Handle click event
  const handleClick = () => {
    onClick(id);
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "vkf-control-button",
        className,
        activeControl === id && "active",
        disabled && "disabled"
      )}
      disabled={disabled}
    >
      {IconComponent === undefined ? (
        <SvgIcons name={iconClassName} size={24} />
      ) : (
        <IconComponent glyph={iconClassName} />
      )}
      <span className="text">{title}</span>
    </button>
  );
};

ControlButton.propTypes = {
  activeControl: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string.isRequired,
  iconClassName: PropTypes.string,
  IconComponent: PropTypes.elementType,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default ControlButton;
