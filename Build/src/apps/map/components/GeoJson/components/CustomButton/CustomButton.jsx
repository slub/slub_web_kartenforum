/**
 * Created by jacob.mendt@pikobytes.de on 02.08.23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import "./CustomButton.scss";
import clsx from "clsx";

//@TODO: Handle disabled state correctly (e.g. set cursor to not-allowed, different style)
// TODO IMPLEMENT loading button animation
const CustomButton = forwardRef(function CustomButton(props, ref) {
  const {
    children,
    className = "",
    onClick,
    type = "default",
    disabled = false,
    loading = false,
    title,
    buttonType,
    form,
  } = props;

  return (
    <button
      className={`vkf-button-${type} ${className} ${clsx(
        loading && "loading"
      )}`}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      title={title}
      type={buttonType}
      form={form}
    >
      {loading === true && (
        <>
          <div className="loading-animation"></div>
          {children}
        </>
      )}
      {loading === false && children}
    </button>
  );
});

CustomButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  title: PropTypes.string,
  type: PropTypes.oneOf([
    "primary",
    "default",
    "delete",
    "discard",
    "edit",
    "save",
  ]),
  buttonType: PropTypes.string,
  form: PropTypes.string,
};
export default CustomButton;
