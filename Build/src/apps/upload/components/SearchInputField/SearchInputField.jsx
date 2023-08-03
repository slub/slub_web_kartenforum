/**
 * Created by jacob.mendt@pikobytes.de on 08.06.2023
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { translate } from "../../../../util/util.js";
import "./SearchInputField.scss";

export default function SearchInputField(props) {
  const { onEnterId } = props;
  const [searchValue, setSearchValue] = useState("");

  // Define ids
  const idInputField = "input-field-search";

  // handle change of search value
  const handleChange = useCallback(
    (e) => {
      setSearchValue(e.target.value);
    },
    [setSearchValue]
  );

  return (
    <div className="search-input-field">
      <label htmlFor={idInputField} className="body1">
        {translate("searchmap-subtitle")}
      </label>
      <div className="input-wrapper">
        <input
          type="text"
          className="input-field body2"
          id={idInputField}
          placeholder={translate("searchmap-placeholder")}
          value={searchValue}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnterId(searchValue);
            }
          }}
        />
        <button
          type="button"
          className="search-button"
          onClick={() => onEnterId(searchValue)}
        >
          <span className="glyphicon glyphicon-search"></span>
        </button>
      </div>
    </div>
  );
}
SearchInputField.propTypes = {
  onEnterId: PropTypes.func.isRequired,
};
