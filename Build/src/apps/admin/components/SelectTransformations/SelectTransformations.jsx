/**
 * Created by jacob.mendt@pikobytes.de on 25.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
  queryTransformationForMapId,
  queryTransformationForUserId,
  queryTransformationForValidation,
} from "@util/apiGeo";
import LoadingSpinner from "@components/LoadingSpinner";
import "./SelectTransformations.scss";

const SELECTION_IDS = {
  BY_VALIDATION: "byValidationState",
  BY_MAPID: "byMapId",
  BY_USERID: "byUserId",
};

const SELECTIONS = [
  {
    desc: "Auswahl von allen gespeicherten Transformation mit einem bestimmten Validierungsstatus",
    id: SELECTION_IDS.BY_VALIDATION,
    label: "Validation",
    type: "radio",
    value: "missing",
    values: ["invalid", "missing"],
  },
  {
    desc: "Auswahl von allen gespeicherten Transformation für eine Karten-Id",
    id: SELECTION_IDS.BY_MAPID,
    label: "Karten-Id",
    type: "input",
    value: "",
  },
  {
    desc: "Auswahl von allen gespeicherten Transformation für eine Nutzer-Id",
    id: SELECTION_IDS.BY_USERID,
    label: "User-Id",
    type: "input",
    value: "",
  },
];

function SelectContentInput(props) {
  const handleChange = (e) => {
    props.onChange(e.target.value, props.id, "input");
  };

  const handleSubmit = () => {
    props.onSubmit(props.value, props.id, "input");
  };

  return (
    <div>
      <p>{props.desc}</p>
      <div className="input-group">
        <input
          value={props.value}
          onChange={handleChange}
          type="text"
          className="form-control"
          placeholder={props.placeholder}
        />
        <span className="input-group-btn">
          <button className="btn btn-default" onClick={handleSubmit}>
            <span
              className="glyphicon glyphicon-search"
              aria-hidden={true}
            ></span>
          </button>
        </span>
      </div>
    </div>
  );
}

SelectContentInput.propTypes = {
  desc: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

function SelectContentRadio(props) {
  return (
    <div>
      <p>{props.desc}</p>
      <div>
        {props.values.map((v) => (
          <div key={v} className="radio">
            <label>
              <input
                type="radio"
                name={`options-${v}`}
                value={v}
                checked={v === props.value}
                readOnly={true}
                onClick={() => props.onChange(v, props.id, "radio")}
              />{" "}
              {v}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

SelectContentRadio.propTypes = {
  desc: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// Async fetch
const fetchTransformationsByMapId = async (mapId, onSuccess) => {
  const response = await queryTransformationForMapId(mapId);
  onSuccess(response.transformations);
};
// Async fetch
const fetchTransformationsByUserId = async (userId, onSuccess) => {
  const response = await queryTransformationForUserId(userId);
  onSuccess(response.transformations);
};
// Async fetch
const fetchTransformationsByValidation = async (validation, onSuccess) => {
  const response = await queryTransformationForValidation(validation);
  onSuccess(response.transformations);
};

export const SelectTransformations = (props) => {
  const [activeSelection, setActiveSelection] = useState(SELECTIONS[0]);
  const [isLoading, setOnLoading] = useState(false);
  const [activeSelectionValues, setActiveSelectionValues] = useState({
    [SELECTIONS[0].id]: SELECTIONS[0].value,
    [SELECTIONS[1].id]: SELECTIONS[1].value,
    [SELECTIONS[2].id]: SELECTIONS[2].value,
  });

  //
  // Handler
  //

  const handleOnClickSelection = (newSelection) => {
    setActiveSelection(newSelection);

    // If the new selection is the validation / radio also fetch the data
    if (newSelection.id === SELECTION_IDS.BY_VALIDATION) {
      setOnLoading(true);
      fetchTransformationsByValidation(
        activeSelectionValues[newSelection.id],
        (newTransformations) => {
          setOnLoading(false);
          props.onChangeTransformations(newTransformations);
        }
      );
    }
  };

  const handleChangeActiveSelectionValue = (selectionValue, selectionId) => {
    setActiveSelectionValues(
      Object.assign({}, activeSelectionValues, {
        [selectionId]: selectionValue,
      })
    );

    if (selectionId === SELECTION_IDS.BY_VALIDATION) {
      setOnLoading(true);
      fetchTransformationsByValidation(selectionValue, (newTransformations) => {
        setOnLoading(false);
        props.onChangeTransformations(newTransformations);
      });
    }
  };

  const handleSubmitInput = (selectionValue, selectionId) => {
    if (selectionId === SELECTION_IDS.BY_MAPID) {
      setOnLoading(true);
      fetchTransformationsByMapId(selectionValue, (newTransformations) => {
        setOnLoading(false);
        props.onChangeTransformations(newTransformations);
      });
    } else if (selectionId === SELECTION_IDS.BY_USERID) {
      setOnLoading(true);
      fetchTransformationsByUserId(selectionValue, (newTransformations) => {
        setOnLoading(false);
        props.onChangeTransformations(newTransformations);
      });
    } else {
      console.warn("Given selection id is not supported.");
    }
  };

  //
  // Effects
  //

  // Initial effect
  useEffect(() => {
    fetchTransformationsByValidation(
      SELECTIONS[0].value,
      props.onChangeTransformations
    );
  }, []);

  return (
    <div className="vkf-select-transformations">
      <div className="nav-container">
        <ul className="nav nav-pills">
          {SELECTIONS.map((s, i) => (
            <li
              key={i}
              role="presentation"
              className={
                activeSelection !== null && activeSelection.id === s.id
                  ? "active"
                  : ""
              }
            >
              <a href={`#`} onClick={() => handleOnClickSelection(s)}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        {isLoading && <LoadingSpinner />}
      </div>
      <div className="select-container">
        {activeSelection !== null && activeSelection.type === "radio" && (
          <SelectContentRadio
            desc={activeSelection.desc}
            id={activeSelection.id}
            onChange={handleChangeActiveSelectionValue}
            value={activeSelectionValues[activeSelection.id]}
            values={activeSelection.values}
          />
        )}
        {activeSelection !== null && activeSelection.type === "input" && (
          <SelectContentInput
            desc={activeSelection.desc}
            id={activeSelection.id}
            onChange={handleChangeActiveSelectionValue}
            onSubmit={handleSubmitInput}
            value={activeSelectionValues[activeSelection.id]}
            placeholder={activeSelection.label}
          />
        )}
      </div>
    </div>
  );
};

SelectTransformations.propTypes = {
  onChangeTransformations: PropTypes.func.isRequired,
};

export default SelectTransformations;
