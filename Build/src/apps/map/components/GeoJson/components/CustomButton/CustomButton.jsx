/**
 * Created by jacob.mendt@pikobytes.de on 02.08.23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import "./CustomButton.scss";

const CustomButton = forwardRef(function CustomButton(props, ref) {
  const {
    children,
    className = "",
    onClick,
    type = "default",
    disabled = false,
    title,
  } = props;

  return (
    <button
      className={`vkf-button-${type} ${className}`}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      title={title}
    >
      {children}
    </button>
  );
});

CustomButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  type: PropTypes.oneOf([
    "primary",
    "default",
    "delete",
    "discard",
    "edit",
    "save",
  ]),
};
export default CustomButton;
