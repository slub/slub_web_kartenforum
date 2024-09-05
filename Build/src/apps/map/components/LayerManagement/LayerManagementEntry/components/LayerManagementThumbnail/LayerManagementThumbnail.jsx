/**
 * Created by nicolas.looschen@pikobytes.de on 04.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { LAYER_TYPES } from "../../../../CustomLayers/LayerTypes.js";
import React, { useState } from "react";
import SettingsProvider from "../../../../../../../SettingsProvider.js";
import { FALLBACK_SRC } from "../../../../MapSearch/components/MapSearchListElement/MapSearchListElementBase.jsx";
import PropTypes from "prop-types";

export const LayerManagementThumbnail = (props) => {
  const { layer } = props;
  const settings = SettingsProvider.getSettings();
  const [src, setSrc] = useState(layer.metadata["vkf:thumb_url"]);

  const layerType = layer.metadata["vkf:type"];
  const layerTitle = layer.metadata["vkf:title"];

  // load fallback image in case the image from the supplied url cannot be loaded
  const handleError = () => {
    if (src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

  return layerType === LAYER_TYPES.GEOJSON ? (
    <div className="thumbnail-container">
      <img
        src={settings.FALLBACK_THUMBNAIL}
        alt={`GeoJSON Image for ${layerTitle}`}
      />
      <span className="geojson-badge">GeoJSON</span>
    </div>
  ) : (
    <div className="thumbnail-container">
      <img
        onError={handleError}
        src={src}
        alt={`Thumbnail Image of Map for ${layerTitle}`}
      />
    </div>
  );
};

LayerManagementThumbnail.propTypes = {
  layer: PropTypes.object.isRequired,
};

export default LayerManagementThumbnail;