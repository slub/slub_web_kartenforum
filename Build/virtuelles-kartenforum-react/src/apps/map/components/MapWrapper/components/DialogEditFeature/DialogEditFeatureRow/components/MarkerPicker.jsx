/**
 * Created by nicolas.looschen@pikobytes.de on 12.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef, useState } from "react";
import { Modal, Overlay } from "react-bootstrap";
import PropTypes from "prop-types";

import { translate } from "../../../../../../../../util/util";
import "./MarkerPicker.scss";

export const MARKER_BASE_URL =
  "/typo3conf/ext/slub_web_kartenforum/Resources/Public/Images/markers/";

export const MARKERS = [
  "marker_blue",
  "marker_green",
  "marker_orange",
  "marker_pink",
  "marker_yellow",
];

export const getMarkerUrl = (marker) => {
  return `${MARKER_BASE_URL}${marker}.png`;
};

export const MarkerPicker = ({ onChange, src }) => {
  const [displayedMarker, setDisplayedMarker] = useState(src);
  const [isPickerOpen, setPickerOpen] = useState(false);

  const inputRef = useRef();
  const refContainer = useRef();

  const handleOpenPicker = (newState) => {
    setPickerOpen((oldState) => {
      return newState === undefined ? !oldState : newState;
    });
  };

  useEffect(() => {
    onChange(displayedMarker);
  }, [displayedMarker]);

  return (
    <div className="vkf-marker-picker-root" ref={refContainer}>
      <div className="marker-preview" onClick={handleOpenPicker} ref={inputRef}>
        <img
          alt={translate("geojson-markerpicker-preview")}
          height={34}
          width={34}
          src={displayedMarker}
        />
      </div>
      <Overlay
        animation={false}
        container={() => refContainer.current}
        show={isPickerOpen}
        onHide={() => handleOpenPicker(false)}
        placement="right"
        rootClose
        target={() => inputRef.current}
      >
        <div className="vkf-map-overlay animation-show marker-picker-overlay">
          <Modal.Header>
            <Modal.Title>
              {translate("geojson-markerpicker-select")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="marker-picker-content">
              {MARKERS.map((marker) => {
                const markerUrl = getMarkerUrl(marker);

                const handleClick = () => {
                  setDisplayedMarker(markerUrl);
                  handleOpenPicker(false);
                };

                return (
                  <div onClick={handleClick} key={marker}>
                    <img alt={marker} height={50} width={50} src={markerUrl} />
                  </div>
                );
              })}
            </div>
          </Modal.Body>
        </div>
      </Overlay>
    </div>
  );
};

MarkerPicker.propTypes = {
  onChange: PropTypes.func,
  src: PropTypes.string,
};

export default MarkerPicker;
