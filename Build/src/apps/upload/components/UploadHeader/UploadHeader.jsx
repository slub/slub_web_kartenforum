/**
 * Created by jacob.mendt@pikobytes.de on 10.07.23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import { translate } from "../../../../util/util.js";
import "./UploadHeader.scss";

export default function UploadHeader(props) {
  const { onBack, mapId } = props;

  return (
    <div className="upload-header">
      <div className="back-btn-container">
        <span className="glyphicon glyphicon-chevron-left" />
        <button className="back-btn body1" onClick={onBack}>
          Back
        </button>
      </div>
      {mapId === null || mapId === undefined ? (
        <h4>{translate("uploadmap-title")}</h4>
      ) : (
        <>
          <h4>{translate("uploadmap-title-update")}</h4>
          <span>ID: {mapId}</span>
        </>
      )}
    </div>
  );
}

UploadHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
  mapId: PropTypes.string,
};
