/**
 * Created by thomas@jung.digital on 21.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useSetRecoilState } from "recoil";

import { translate } from "../../../../../util/util.js";
import SvgIcons from "../../../../../components/SvgIcons/SvgIcons.jsx";
import { notificationState } from "../../../../../atoms/atoms.js";
import { parseGeoJsonFile } from "../../Dropzone/util.js";
import "./GeoJsonUploadHint.scss";

export const GeoJsonUploadHint = ({ onAddGeoJson }) => {
  const [open, setOpen] = useState(false);
  const setNotification = useSetRecoilState(notificationState);

  const refFileInput = useRef();

  ////
  // Handler section
  ////

  // Open menu
  const handleOpenMenu = () => {
    setOpen(true);
  };

  // Close menu
  const handleCloseMenu = () => {
    setOpen(false);
  };

  // open file upload dialog
  const handleOpenFileDialog = () => {
    if (refFileInput.current !== undefined && refFileInput.current !== null) {
      handleCloseMenu();
      refFileInput.current.click();
    }
  };

  // handle an error parsing the file
  const handleParseError = () => {
    setNotification({
      id: "geojsonUploadHint",
      type: "danger",
      text: translate("mapwrapper-geojson-parse-error"),
    });
  };

  // publish geojson file
  const handleSelectGeoJsonFile = (e) => {
    const file = e.target.files[0];
    parseGeoJsonFile(file, onAddGeoJson, handleParseError);
  };

  return (
    <div
      className={clsx("geojson-upload-hint", open && "show")}
      aria-describedby="geojson-upload-label"
    >
      <button
        className="geojson-upload"
        onMouseEnter={handleOpenMenu}
        onMouseLeave={handleCloseMenu}
        onClick={handleOpenFileDialog}
      >
        <SvgIcons name="layermanagement-upload" />
        <span className="label" id="geojson-upload-label">
          {translate("geojson-adddialog-title")}
        </span>
      </button>
      <div className="upload-info">{translate("geojson-adddialog-body")}</div>
      <label className="visually-hidden" htmlFor="geojson-upload-file">GeoJSON Upload</label>
      <input
        id="geojson-upload-file"
        accept="application/json, application/geo+json, .geojson"
        className="hidden-file-input"
        type="file"
        ref={refFileInput}
        onChange={handleSelectGeoJsonFile}
      />
    </div>
  );
};

GeoJsonUploadHint.propTypes = {
  onAddGeoJson: PropTypes.func,
};

export default GeoJsonUploadHint;
