/**
 * Created by nicolas.looschen@pikobytes.de on 17/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import React, { useRef, useState } from "react";
import { useCombobox } from "downshift";
import PropTypes from "prop-types";
import clsx from "clsx";
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

  // debounces the update of the suggestions
  // => only request data if there was no input for {timeout} ms
  const debounceUpdateData = (inputValue) => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      fetchInputItems(inputValue).then((parsedData) =>
        setInputItems(parsedData)
      );
    }, timeout);
  };

  // Reset selected item and start a data update
  const handleInputValueChange = ({ inputValue }) => {
    if (selectedItem !== undefined) setSelectedItem(undefined);
    debounceUpdateData(inputValue);
  };

  // Stores the selected item in the internal state
  const handleSelectValue = ({ selectedItem }) => {
    if (onSelectedItemChange !== undefined) {
      onSelectedItemChange(selectedItem);
    }

    setSelectedItem(selectedItem);
  };

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({
    items: inputItems,
    itemToString: itemToString,
    onInputValueChange: handleInputValueChange,
    onSelectedItemChange: handleSelectValue,
  });

  const { onClick, ...restButtonProps } = buttonProps ?? {};

  const { ref, ...rest } = getInputProps();
  return (
    <div className="vkf-autocomplete-container">
      <label {...getLabelProps()} id={rest["aria-labelledby"]} className="visually-hidden">
        {label !== undefined ? label : inputProps.placeholder}
      </label>
      <div className="form-group" {...getComboboxProps()}>
        <input
          {...rest}
          ref={(el) => {
            ref(el);
            inputRef.current = el;
          }}
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
        <ul
          className="autocomplete-result-list"
          {...getMenuProps()}
          id={rest["aria-controls"]}
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <li
                className={clsx(
                  "ui-menu-item",
                  highlightedIndex === index && "highlighted",
                  selectedItem === item && "selected"
                )}
                key={`${item.label}${index}`}
                {...getItemProps({
                  item,
                  index,
                })}
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
