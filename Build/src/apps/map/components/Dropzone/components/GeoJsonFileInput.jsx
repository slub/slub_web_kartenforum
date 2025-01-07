/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback } from "react";

import "./GeoJsonFileInput.scss";
import PropTypes from "prop-types";

export const GeoJsonFileInput = ({ refFileInput, onSelectFile }) => {
  const handleChange = useCallback((e) => {
    onSelectFile(e.target.files[0]);
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <>
      <label className="visually-hidden" htmlFor="geojson-upload-file">
        GeoJSON Upload
      </label>
      <input
        onClick={handleClick}
        id="geojson-upload-file"
        accept="application/json, application/geo+json, .geojson"
        className="hidden-file-input"
        type="file"
        ref={refFileInput}
        onChange={handleChange}
      />
    </>
  );
};

GeoJsonFileInput.propTypes = {
  refFileInput: PropTypes.object.isRequired,
  onSelectFile: PropTypes.func.isRequired,
};

export default GeoJsonFileInput;
