/**
 * Created by jacob.mendt@pikobytes.de on 26.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";
import PropTypes from "prop-types";
import clsx from "clsx";
import SettingsProvider from "../../../../SettingsProvider";
import { postJob } from "../../../../util/apiGeo";
import DialogValidation from "../DialogValidation/DialogValidation";
import "./TransformationItem.scss";

const validationStates = ["missing", "valid", "invalid"];
const validationClass = (v) =>
  v === "missing" ? "warning" : v === "valid" ? "success" : "danger";

function ValidationButton({ validation, onSelect }) {
  return (
    <DropdownButton
      id="validation-button"
      pullRight
      className="btn-validation"
      bsStyle={validationClass(validation)}
      title={`Validation: ${validation}`}
      key={validation}
    >
      {["valid", "invalid"].map((v) => (
        <MenuItem key={v} onClick={() => onSelect(v)}>
          Setze Validation auf &quot;{v}&quot;
        </MenuItem>
      ))}
    </DropdownButton>
  );
}

ValidationButton.propTypes = {
  validation: PropTypes.oneOf(validationStates).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export const TransformationItem = (props) => {
  const {
    isActive = false,
    className = "",
    data,
    onClickPreview = () =>
      console.log(
        "The function onClickPreview is not passed to component TransformationItem."
      ),
  } = props;
  const {
    is_active,
    clip,
    params,
    map_id,
    metadata,
    submitted,
    transformation_id,
    user_id,
    validation,
  } = data;
  const linkToGeoref = SettingsProvider.getSettings().LINK_TO_GEOREFERENCE;
  const [internalValidation, setInternalValidation] = useState(validation);
  const [showGeoreferenceAll, setShowGeoreferenceAll] = useState(false);
  const [validationDialog, setValidationDialog] = useState(null);

  const handleSelectNewValidation = (transformationId, newValidationValue) => {
    if (newValidationValue !== internalValidation) {
      setValidationDialog({
        transformationId: transformationId,
        validationValue: newValidationValue,
      });
    }
  };

  const handleSubmitNewValidation = (o) => {
    const newJob = {
      name:
        o.validationValue === "valid"
          ? "transformation_set_valid"
          : "transformation_set_invalid",
      description: {
        comment: o.comment,
        transformation_id: o.transformationId,
      },
    };

    setInternalValidation(o.validationValue);
    setValidationDialog(null);
    postJob(newJob);
  };

  return (
    <div
      className={clsx(
        "vkf-transformation-item panel panel-default",
        isActive ? "preview-on" : "",
        className
      )}
    >
      <div className="panel-heading">
        {metadata.title_short}
        <span
          className={clsx("state-signal", validationClass(internalValidation))}
        />
      </div>
      <div className="panel-body">
        <p>
          <strong>Transformation-ID:</strong> {transformation_id}
        </p>
        <p>
          <strong>Karten-ID:</strong> {map_id}
        </p>
        <p>
          <strong>Aktiv:</strong> {is_active ? "Ja" : "Nein"}
        </p>
        <p>
          <strong>Erstellt von:</strong> {user_id}
        </p>
        <p>
          <strong>Erstellt am:</strong> {submitted}
        </p>
        <div
          className={clsx("georef-params", showGeoreferenceAll ? "all" : "")}
        >
          <p>
            <strong>Parameter:</strong> {!showGeoreferenceAll ? "..." : ""}
          </p>
          <div>
            <p>Passpunkte</p>
            <p>{JSON.stringify(params, null, 2)}</p>
            <br />
            <p>Clip-Polygon</p>
            <p>{JSON.stringify(clip, null, 2)}</p>
            <br />
            <a
              href={`${linkToGeoref}?transformation_id=${transformation_id}&map_id=${map_id}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-default btn-georef"
            >
              <span className="icon"></span> Gehe zu Georeferenzierung
            </a>
          </div>
        </div>
      </div>
      <div className="panel-footer">
        <button
          className="btn btn-default"
          onClick={() => onClickPreview(data)}
        >
          Zeige Preview
        </button>
        <button
          className="btn btn-default"
          onClick={() => setShowGeoreferenceAll(!showGeoreferenceAll)}
        >
          {showGeoreferenceAll ? "Schließe Parameter" : "Zeige Parameter"}
        </button>
        <ValidationButton
          validation={internalValidation}
          onSelect={(v) => handleSelectNewValidation(transformation_id, v)}
        />
      </div>

      {validationDialog !== null && (
        <DialogValidation
          onSubmit={handleSubmitNewValidation}
          onClose={() => setValidationDialog(null)}
          transformationId={validationDialog.transformationId}
          validationValue={validationDialog.validationValue}
        />
      )}
    </div>
  );
};

TransformationItem.propTypes = {
  isActive: PropTypes.bool,
  className: PropTypes.string,
  data: PropTypes.shape({
    is_active: PropTypes.bool,
    clip: PropTypes.object,
    overwrites: PropTypes.number.isRequired,
    params: PropTypes.object.isRequired,
    submitted: PropTypes.string.isRequired,
    transformation_id: PropTypes.number.isRequired,
    user_id: PropTypes.string.isRequired,
    map_id: PropTypes.string.isRequired,
    metadata: PropTypes.shape({
      time_publish: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      title_short: PropTypes.string.isRequired,
    }),
    validation: PropTypes.oneOf(validationStates).isRequired,
  }).isRequired,
  onClickPreview: PropTypes.func,
};

export default TransformationItem;
