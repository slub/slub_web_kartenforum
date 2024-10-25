/**
 * Created by jacob.mendt@pikobytes.de on 29.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import "./DialogValidation.scss";

const DEFAULT_COMMENTS = [
  { id: "comment-1", text: "Ungenauigkeit" },
  { id: "comment-2", text: "Falsche Parameter" },
  { id: "comment-3", text: "Falsche Kartennummer" },
  { id: "comment-4", text: "Schlechte Genauigkeit des Originals" },
  { id: "others", text: "Andere Begründung:" },
];
export const DialogValidation = (props) => {
  const { onClose, onSubmit, transformationId, validationValue } = props;
  const [radioValue, setRadioValue] = useState(DEFAULT_COMMENTS[0].id);
  const [textAreaValue, setTextValueArea] = useState("");

  const handleChangeRadio = (e) => {
    setRadioValue(e.target.value);
  };

  const handleOnClose = () => {
    onClose();
  };

  const handleOnSubmit = () => {
    onSubmit({
      comment:
        radioValue !== "others"
          ? DEFAULT_COMMENTS.find((o) => o.id === radioValue).text
          : textAreaValue,
      transformationId: transformationId,
      validationValue: validationValue,
    });
  };

  const handleChangeTextArea = (e) => {
    setTextValueArea(e.target.value);
  };

  return (
    <div className="vkf-dialog-jobs-validation">
      <Modal
        className={"vkf-dialog-jobs-validation"}
        show={true}
        onHide={handleOnClose}
      >
        <Modal.Header>
          <Modal.Title>
            Setze validation=&quot;{validationValue}&quot;{" "}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="dialog-content">
            <p>
              Soll der Validierungsstatus für die Transformation mit der ID{" "}
              {transformationId} auf &quot;{validationValue}&quot; gesetzt
              werden.
              {validationValue === "invalid"
                ? "Für invalide Transformationen geben Sie bitte eine Begründung mit an."
                : ""}
            </p>
            {validationValue === "invalid" && (
              <React.Fragment>
                <br />
                <p>Begründung:</p>
                {DEFAULT_COMMENTS.map((r, i) => (
                  <div className="radio" key={i}>
                    <label>
                      <input
                        type="radio"
                        name={r.id}
                        id={r.id}
                        value={r.id}
                        checked={r.id === radioValue}
                        onChange={handleChangeRadio}
                      />{" "}
                      {r.text}
                    </label>
                  </div>
                ))}
                <br />
                <textarea
                  className="form-control"
                  rows="3"
                  disabled={radioValue !== "others"}
                  onChange={handleChangeTextArea}
                />
              </React.Fragment>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleOnClose}>Abbrechen</Button>
          <Button onClick={handleOnSubmit} bsStyle="primary">
            Save changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

DialogValidation.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  transformationId: PropTypes.any.isRequired,
  validationValue: PropTypes.string.isRequired,
};

export default DialogValidation;
