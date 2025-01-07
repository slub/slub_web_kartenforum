import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useRecoilState } from "recoil";
import { addedFileState } from "@map/atoms";
import { ControlLabel, FormControl, FormGroup } from "react-bootstrap";

import { useAddGeoJson } from "@map/components/GeoJson/util/hooks/useAddGeoJson";
import ToggleSwitch from "@map/components/ToggleSwitch/ToggleSwitch";
import { translate } from "@util/util";
import { isVectorMapCreateAllowed } from "@map/components/GeoJson/util/authorization";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import Modal from "@components/Modal";

import "./DialogAddGeoJson.scss";

const TOGGLE_SWITCH_ID = "persistGeoJson";

const AddGeoJsonForm = ({ onSubmit, initialName, onClose }) => {
  return (
    <>
      <form id="add-geojson-form" onSubmit={onSubmit}>
        <FormGroup>
          <p className="adddialog-description">
            {translate("geojson-adddialog-description")}
          </p>
          <ControlLabel className="geojson-label" htmlFor="title">
            {translate("geojson-adddialog-layer-title-label")}
          </ControlLabel>
          <FormControl
            autoFocus
            defaultValue={initialName ?? "Unknown"}
            name="title"
            type="text"
            className="geojson-input"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel className="switch-label" htmlFor={TOGGLE_SWITCH_ID}>
            <ToggleSwitch
              disabled={!isVectorMapCreateAllowed()}
              id={TOGGLE_SWITCH_ID}
            />
            <p className="geojson-label persistent-button-label">
              {translate("geojson-adddialog-persistent-button-label")}
            </p>
          </ControlLabel>
          <div>
            <p className="persistent-button-description">
              {translate("geojson-adddialog-persistent-description")}
            </p>
          </div>
        </FormGroup>
      </form>

      <div className="add-geojson-buttons">
        <CustomButton
          type="save"
          form="add-geojson-form"
          className="btn btn-primary confirm-button"
        >
          {translate("geojson-adddialog-confirm")}
        </CustomButton>
        <CustomButton
          className="cancel-button"
          type="discard"
          onClick={onClose}
        >
          {translate("geojson-adddialog-cancel")}
        </CustomButton>
      </div>
    </>
  );
};
AddGeoJsonForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

const DialogAddGeoJsonBase = ({ initialName, onClose, onSubmit }) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={translate("geojson-adddialog-title")}
      renderContent={() => (
        <AddGeoJsonForm
          initialName={initialName}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      )}
      modalClassName="vkf-dialog-add-geojson"
    />
  );
};

DialogAddGeoJsonBase.propTypes = {
  initialName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const DialogAddGeoJson = () => {
  const [addedFile, setAddedFile] = useRecoilState(addedFileState);
  const addGeoJson = useAddGeoJson();

  const handleClose = useCallback(() => {
    setAddedFile(null);
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const title = formData.get("title");
      const persistGeoJson = formData.get("persistGeoJson") === "on";

      addGeoJson(title, addedFile.content, persistGeoJson).then(() => {
        setAddedFile(null);
      });
    },
    [addGeoJson, addedFile, setAddedFile]
  );

  return addedFile ? (
    <DialogAddGeoJsonBase
      initialName={addedFile.name}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  ) : null;
};

export default DialogAddGeoJson;
