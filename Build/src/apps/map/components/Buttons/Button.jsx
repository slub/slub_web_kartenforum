/**
 * Created by jacob.mendt@pikobytes.de on 02.08.23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import {Button as BootstrapButton} from "react-bootstrap";
import "./Button.scss"

export default function Button(props) {
  const {
    children,
    className = "",
    onClick,
    type = "default"
  } = props;

  return (
    <BootstrapButton className={`vkf-button-base vkf-button-${type} ${className}`} onClick={onClick} type="button">
      {children}
    </BootstrapButton>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["primary", "default"])
}
