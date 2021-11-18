/**
 * Created by nicolas.looschen@pikobytes.de on 17/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import React, { useRef, useState } from "react";
import { useCombobox } from "downshift";
import PropTypes from "prop-types";

import "./Autocomplete.scss";

export function Autocomplete({
  buttonProps,
  fetchInputItems,
  label,
  itemToString,
  inputProps,
  onSelectedItemChange,
  timeout = 300,
}) {
  const [inputItems, setInputItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(undefined);
  const inputRef = useRef();
  const timeoutRef = useRef(null);

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    itemToString: itemToString,
    onInputValueChange: ({ inputValue }) => {
      if (selectedItem !== undefined) setSelectedItem(undefined);

      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        fetchInputItems(
          inputValue,
          (resp) => {
            setInputItems(resp);
          },
          true
        );
      }, timeout);
    },
    onSelectedItemChange: (e) => {
      if (onSelectedItemChange !== undefined) {
        onSelectedItemChange(e.selectedItem);
      }

      setSelectedItem(e.selectedItem);
    },
  });

  const { onClick, ...restButtonProps } = buttonProps ?? {};

  return (
    <div>
      {label !== undefined && <label {...getLabelProps()}>{label}</label>}
      <div className="form-group" {...getComboboxProps()}>
        <input
          {...getInputProps()}
          ref={inputRef}
          type="text"
          {...inputProps}
        />

        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label={"toggle menu"}
          {...restButtonProps}
          {...(onClick !== undefined
            ? {
                onClick: () => {
                  onClick(
                    selectedItem,
                    inputRef.current !== null ? inputRef.current.value : ""
                  );
                },
              }
            : {})}
        >
          &#8595;
        </button>
      </div>

      <div className="autocomplete-dropdown">
        <ul {...getMenuProps()}>
          {isOpen &&
            inputItems.map((item, index) => (
              <li
                className="ui-menu-item"
                key={`${item.label}${index}`}
                {...getItemProps({ item, index })}
              >
                {item.label}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

Autocomplete.propTypes = {
  buttonProps: PropTypes.object,
  fetchInputItems: PropTypes.func,
  label: PropTypes.string,
  inputProps: PropTypes.object,
  itemToString: PropTypes.func,
  onSelectedItemChange: PropTypes.func,
  timeout: PropTypes.number,
};
