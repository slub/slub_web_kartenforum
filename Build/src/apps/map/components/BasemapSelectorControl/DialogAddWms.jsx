/**
 * Created by jacob.mendt@pikobytes.de on 07.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useSetRecoilState } from "recoil";
import clsx from "clsx";
import PropTypes from "prop-types";
import { notificationState } from "@atoms";
import { translate } from "@util/util";
import { fetchAndParseWmsCapabilities } from "./util";
import { isValidUrl } from "@util/util";
import "./DialogAddWms.scss";

export const DialogAddWms = (props) => {
  const { onClose, onSubmit } = props;
  const [url, setUrl] = useState("");
  const [highlightUrlHelperMsg, setHighlightUrlHelperMsg] = useState(false);
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const setNotification = useSetRecoilState(notificationState);
  const refUrlInput = useRef();
  const refLayerSelect = useRef();

  // Utility function for dispatching errors
  const dispatchError = (errorMsg) => {
    setLayers([]);
    setSelectedLayer(null);
    setNotification({
      id: "dialog-add-wms",
      type: "danger",
      text: errorMsg,
    });
  };

  //
  // Handler
  //

  const handleOnClose = () => {
    onClose();
  };

  const handleOnSubmit = () => {
    onSubmit(selectedLayer);
    handleOnClose();
  };

  // Handler for loading the WMS capabilities
  const handleLoadWmsCapabilities = async () => {
    if (!isValidUrl(url)) {
      setHighlightUrlHelperMsg(true);
      return;
    }

    try {
      const newLayers = await fetchAndParseWmsCapabilities(url);
      if (newLayers.length !== 0) {
        setLayers(newLayers);
        setSelectedLayer(newLayers[0]);
      }
    } catch {
      dispatchError(translate("dialog.add-wms.error.invalid-url"));
    }
  };

  // Handler for changing the value of the WMS url field
  const handleChangeWmsUrl = (e) => {
    setUrl(e.target.value);
  };

  // Used for detecting "Enter" operation on the url input
  const handleKeyDownWmsUrl = (e) => {
    if (e.code === "Enter") {
      handleLoadWmsCapabilities();
    }
  };

  // Used for proper changing of the select layer element
  const handleChangeSelectLayer = (e) => {
    const newSelectedLayer = layers.find((l) => l.id === e.target.value);
    setSelectedLayer(newSelectedLayer);
  };

  return (
    <div>
      <Modal className="vkf-dialog-addwms" show={true} onHide={handleOnClose}>
        <Modal.Header>
          <Modal.Title>
            {translate("control-basemapselector-addwms-title")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="dialog-content">
            <div
              className={clsx(
                "form-group",
                "set-url",
                highlightUrlHelperMsg ? "has-warning" : ""
              )}
            >
              <label htmlFor={refUrlInput.current}>
                {translate("control-basemapselector-addwms-input-label")}
              </label>
              <div className="form-group-capabilities">
                <input
                  type="url"
                  className="form-control"
                  ref={refUrlInput}
                  placeholder="https://meinwms.de?Request=GetCapabilities&Service=WMS&Version=1.3.0"
                  value={url}
                  onChange={handleChangeWmsUrl}
                  onKeyDown={handleKeyDownWmsUrl}
                />
                <button
                  type="submit"
                  className="btn"
                  onClick={handleLoadWmsCapabilities}
                >
                  {translate(
                    "control-basemapselector-addwms-btn-load-capabilities"
                  )}
                </button>
              </div>
              <p className="help-block">
                {translate("control-basemapselector-addwms-input-description")}
              </p>
            </div>

            {layers.length > 0 && selectedLayer !== null && (
              <div className={clsx("form-group", "set-layer")}>
                <label htmlFor={refLayerSelect.current}>
                  {translate("control-basemapselector-addwms-select-label")}
                </label>
                <select
                  ref={refLayerSelect}
                  value={selectedLayer.id}
                  onChange={handleChangeSelectLayer}
                  className="form-control"
                >
                  {layers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <p className="help-block">
                  {translate(
                    "control-basemapselector-addwms-select-description"
                  )}
                </p>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleOnClose}>
            {translate("control-basemapselector-addwms-btn-canel")}
          </Button>
          <Button
            onClick={handleOnSubmit}
            bsStyle="primary"
            className={clsx(selectedLayer === null ? "disabled" : "")}
          >
            {translate("control-basemapselector-addwms-btn-submit")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

DialogAddWms.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DialogAddWms;
