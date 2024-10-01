/**
 * Created by nicolas.looschen@pikobytes.de on 01.07.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import {
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
} from "react-bootstrap";

import {
  mosaicMapSelectedLayersState,
  mosaicMapSelectedMosaicMapState,
} from "../../atoms/atoms.js";
import { VALUE_CREATE_NEW_MAP } from "../MosaicMapSelectorDropdown/MosaicMapSelectorDropdown.jsx";
import SaveIndicator from "./components/SaveIndicator/SaveIndicator.jsx";
import { translate } from "../../../../util/util.js";

import "./MosaicMapInputPanel.scss";

const inputFields = [
  {
    id: "name",
  },
  {
    className: "form-group grow",
    id: "title",
  },
  {
    id: "title_short",
    className: "small-input",
  },
  {
    className: "small-input",
    id: "time_of_publication",
    type: "number",
    extraProps: {
      min: 0,
      max: 2100,
    },
  },
  {
    id: "link_thumb",
  },
  {
    className: "description",
    id: "description",
    extraProps: {
      allowEmpty: true,
    },
  },
  {
    className: "small-input",
    id: "map_scale",
    type: "number",
    extraProps: {
      min: 0,
      max: 20000000000,
    },
  },
];

export const MosaicMapInputPanel = () => {
  const selectedMosaicLayers = useRecoilValue(mosaicMapSelectedLayersState);
  const [selectedMosaicMap, setSelectedMosaicMap] = useRecoilState(
    mosaicMapSelectedMosaicMapState
  );
  const [, setForceUpdate] = useState(0);

  const validateField = (fieldKey, field) => {
    const { allowEmpty, min, max } = field.extraProps ?? {
      allowEmpty: false,
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
    };

    const inputField = document.getElementById(fieldKey);
    if (inputField !== null && selectedMosaicMap[fieldKey] !== undefined) {
      // validate string fields
      if (field.type === "string") {
        const value = inputField.value;
        if (value.length > 0 || allowEmpty) {
          return "success";
        } else {
          return "error";
        }
      }

      // validate number fields
      if (field.type === "number") {
        const value = inputField.valueAsNumber;
        if (value >= min && value <= max) {
          return "success";
        } else {
          return "error";
        }
      }
    }

    return null;
  };

  const handleChange = (event) => {
    const field = event.target.id;

    const type = inputFields.find((row) => row.id === field).type;

    let value;

    if (type === "number") {
      value = event.target.valueAsNumber;
    } else if (type === "date") {
      value = event.target.value;
    } else {
      value = event.target.value;
    }

    setSelectedMosaicMap((oldSelectedMap) => ({
      ...oldSelectedMap,
      [field]: value,
    }));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.target.blur();
    }
  };

  // this forces a re-render in order to validate the fields after the default values are set
  useEffect(() => {
    setForceUpdate(Date.now());
  }, [selectedMosaicMap.id]);

  useEffect(() => {
    setSelectedMosaicMap((oldSelectedMosaicMap) => ({
      ...oldSelectedMosaicMap,
      raw_map_ids: selectedMosaicLayers?.map((layer) => layer.getId()) ?? [],
    }));
  }, [selectedMosaicLayers]);

  return (
    <div className="vk-mosaic-map-input-panel-content">
      <div className="vk-mosaic-map-input-panel-header">
        <div className="vk-mosaic-map-title">
          <h3>
            {selectedMosaicMap.title === undefined ||
            (selectedMosaicMap.title === "" &&
              selectedMosaicMap.id === VALUE_CREATE_NEW_MAP)
              ? translate("mosaic-maps-input-panel-title")
              : selectedMosaicMap.title}
          </h3>
          <div className="divider" />
          <h4 className="subtitle">
            ID:{" "}
            {selectedMosaicMap.id === VALUE_CREATE_NEW_MAP
              ? "undefined"
              : selectedMosaicMap.id}
          </h4>
        </div>
        <SaveIndicator />
      </div>
      <div className="input-container">
        <Form>
          {inputFields.map((field, index) => (
            <FieldGroup
              bsClass={field.className}
              defaultValue={selectedMosaicMap[field.id]}
              key={`${selectedMosaicMap.id}_${index}`}
              id={field.id}
              type={field.type}
              label={translate(`mosaic-maps-input-panel-field_${field.id}`)}
              placeholder={
                field.id === "name"
                  ? translate(`mosaic-maps-input-panel-help_${field.id}`)
                  : undefined
              }
              onBlur={handleChange}
              onKeyDown={handleKeyDown}
              validationState={validateField(field.id, field)}
            />
          ))}
        </Form>
      </div>
    </div>
  );
};

function FieldGroup({ id, label, help, bsClass, validationState, ...props }) {
  return (
    <FormGroup
      bsClass={bsClass}
      controlId={id}
      validationState={validationState}
    >
      <div className="label-container">
        <ControlLabel>{label}</ControlLabel>
      </div>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

FieldGroup.propTypes = {
  bsClass: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  help: PropTypes.string,
  validationState: PropTypes.string,
};

export default MosaicMapInputPanel;
