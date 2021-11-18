/**
 * Created by jacob.mendt@pikobytes.de on 16.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import "./ControlButton.scss";

export const ControlButton = (props) => {
  const {
    activeControl = null,
    className = "",
    iconClassName = "",
    id = "unknown",
    onClick,
    title = "unknown",
  } = props;

  // Handle click event
  const handleClick = () => {
    onClick(id);
  };

  return (
    <div
      className={clsx(
        "vkf-control-button",
        className,
        activeControl === id ? "active" : ""
      )}
    >
      <button className="btn btn-default btn-vkf-control" onClick={handleClick}>
        <span className="text">{title}</span>
        <span className={clsx("icon", iconClassName)} />
      </button>
    </div>
  );
};

ControlButton.propTypes = {
  activeControl: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default ControlButton;
