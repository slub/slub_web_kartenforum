/**
 * Created by pouria.rezaei@pikobytes.de on 18/07/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { translate } from "../../../../../../../util/util";
import SettingsProvider from "../../../../../../../SettingsProvider.js";
import PropTypes from "prop-types";
import "./ImageFallback.scss";

export const ImageFallback = ({ typeOfView }) => {
  return (
    <div
      className={`broken-img-container ${typeOfView === "view" ? "view" : ""}`}
    >
      <img
        src={SettingsProvider.getSettings().FALLBACK_NOT_FOUND}
        alt="broken image"
      />
      <p>{translate("geojson-image-fallback-p")}</p>
    </div>
  );
};
export default ImageFallback;
ImageFallback.propTypes = {
  typeOfView: PropTypes.string,
};
