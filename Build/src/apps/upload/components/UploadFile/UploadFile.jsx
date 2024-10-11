/**
 * Created by pouria.rezaei@pikobytes.de on 15.06.2023
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";
import { translate } from "@util/util";
import "./UploadFile.scss";

const fileUpload = {
  name: "file",
  id: "file-upload",
  accept: "image/tiff",
};

export default function UploadFile(props) {
  const { mapMetadata, isPending, onFileSelect } = props;

  //
  // Handler section
  //
  const handleFileChange = (event) => {
    event.preventDefault();
    if (event.target.files) {
      const file = event.target.files[0];
      onFileSelect(file);
    }
  };
  const handleUploadClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById(fileUpload.id).click();
  };

  return (
    <div className="upload-file-container">
      <div className="upload-section" onClick={handleUploadClick}>
        {mapMetadata.link_thumb_mid !== null && isPending === false && (
          <img
            src={mapMetadata.link_thumb_mid}
            alt="Thumbnail"
            className="thumbnail-img"
          />
        )}

        {isPending === true && (
          <div className="image-selected">
            <label className="body1">{translate("uploadfile-label")}</label>
          </div>
        )}

        {mapMetadata.link_thumb_mid === null && isPending === false && (
          <div className="select-image">
            <div>
              <span className="glyphicon glyphicon-picture"></span>
            </div>
            <label className="body1" htmlFor={fileUpload.id}>
              {translate("uploadmap-upload-file")}
            </label>
          </div>
        )}
      </div>

      <div className="input-file">
        <input
          type="file"
          id={fileUpload.id}
          accept={fileUpload.accept}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

UploadFile.propTypes = {
  isPending: PropTypes.bool,
  mapMetadata: PropTypes.object,
  onFileSelect: PropTypes.func,
};
