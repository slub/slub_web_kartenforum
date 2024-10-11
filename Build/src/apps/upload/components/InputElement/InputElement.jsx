/**
 * Created by jacob.mendt@pikobytes.de on 15.06.23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useFormContext } from "react-hook-form";
import PropTypes from "prop-types";
import { findInputError } from "@upload/utils/util.js";
import "./InputElement.scss";

const isFormInvalid = (err) => {
  return Object.keys(err).length > 0;
};

const InputError = ({ message }) => {
  return (
    <div>
      <span
        className="glyphicon glyphicon-exclamation-sign"
        aria-hidden="true"
      ></span>
      <span className="sr-only">Error:</span>
      {message}
    </div>
  );
};

InputError.propTypes = {
  message: PropTypes.string,
};

export const Input = (props) => {
  const { name, label, type, id, validation, multiline, options } = props;
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const inputErrors = findInputError(errors, name);
  const isInvalid = isFormInvalid(inputErrors);

  return (
    <>
      <div className={`error-label-container ${isInvalid ? "show-error" : ""}`}>
        <label htmlFor={id} className="font-semibold capitalize body1">
          {label}
          {validation.required.value && <span className="required">*</span>}
        </label>
        {isInvalid && (
          <InputError
            message={inputErrors.error.message}
            key={inputErrors.error.message}
          />
        )}
      </div>
      {multiline ? (
        <textarea
          className="body2"
          name={name}
          id={id}
          rows="6"
          {...register(name, validation)}
        />
      ) : options ? (
        <select
          className="body2"
          name={name}
          id={id}
          {...register(name, validation)}
        >
          {options.map((option) => (
            <option value={option.value} key={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="body2"
          type={type}
          id={id}
          {...register(name, validation)}
        />
      )}
    </>
  );
};

Input.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  validation: PropTypes.object.isRequired,
  multiline: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
      label: PropTypes.string,
    })
  ),
};

export default Input;
