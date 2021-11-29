/**
 * Created by jacob.mendt@pikobytes.de on 25.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { queryTransformationForValidation } from "../../../../util/apiGeo";
import "./SelectTransformations.scss";

const SELECTIONS = [
    {
        desc: "Auswahl von allen gespeicherten Transformation mit einem bestimmten Validierungsstatus",
        id: "byValidationState",
        label: "Validation",
        type: "radio",
        value: "missing",
        values: ["valid", "invalid", "missing"],
    },
    {
        desc: "Auswahl von allen gespeicherten Transformation für eine Karten-Id",
        id: "byMapId",
        label: "Karten-Id",
        type: "input",
        value: "",
    },
    {
        desc: "Auswahl von allen gespeicherten Transformation für eine Nutzer-Id",
        id: "byUserId",
        label: "User-Id",
        type: "input",
        value: "",
    },
];

function SelectContentInput(props) {
    const handleChange = (e) => {
        props.onChange(e.target.value, "input");
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
                    <button
                        className="btn btn-default"
                        onClick={props.onSubmit}
                    >
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
                                onClick={() =>
                                    props.onChange(v, props.id, "radio")
                                }
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

// Async fetchs
const fetchTransformationsByValidation = async (validation, onSuccess) => {
    const response = await queryTransformationForValidation(validation);
    onSuccess(response.transformations);
};

export const SelectTransformations = (props) => {
    const [activeSelection, setActiveSelection] = useState(SELECTIONS[0]);
    const [activeSelectionValue, setActiveSelectionValue] = useState(
        SELECTIONS[0].value
    );

    //
    // Handler
    //

    const handleOnClickSelection = (newSelection) => {
        setActiveSelection(newSelection);
        handleChangeActiveSelectionValue(
            newSelection.value,
            newSelection.id,
            "radio"
        );
    };

    const handleChangeActiveSelectionValue = (
        newActiveSelectionValue,
        id,
        type
    ) => {
        setActiveSelectionValue(newActiveSelectionValue);

        if (type === "radio" && id === "byValidationState") {
            fetchTransformationsByValidation(
                newActiveSelectionValue,
                props.onChangeTransformations
            );
        }
    };

    const handleSubmitInput = () => {
        console.log("Submit");
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
                                activeSelection !== null &&
                                activeSelection.id === s.id
                                    ? "active"
                                    : ""
                            }
                        >
                            <a
                                href={`#${i.id}`}
                                onClick={() => handleOnClickSelection(s)}
                            >
                                {s.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="select-container">
                {activeSelection !== null &&
                    activeSelection.type === "radio" && (
                        <SelectContentRadio
                            desc={activeSelection.desc}
                            id={activeSelection.id}
                            onChange={handleChangeActiveSelectionValue}
                            value={activeSelectionValue}
                            values={activeSelection.values}
                        />
                    )}
                {activeSelection !== null &&
                    activeSelection.type === "input" && (
                        <SelectContentInput
                            desc={activeSelection.desc}
                            id={activeSelection.id}
                            onChange={handleChangeActiveSelectionValue}
                            onSubmit={handleSubmitInput}
                            value={activeSelectionValue}
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
