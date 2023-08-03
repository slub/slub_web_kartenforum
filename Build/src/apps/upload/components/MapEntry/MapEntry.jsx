/**
 * Created by jacob.mendt@pikobytes.de on 15.06.23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import "./MapEntry.scss";

export default function MapEntry(props) {
  const { mapId, mapMetadata, onClick } = props;

  return (
    <li className="map-entry-item" onClick={onClick}>
      <div className="image-container">
        <img
          src={mapMetadata.link_thumb_small}
          alt="Map Image"
          loading="lazy"
        />
      </div>
      <div className="metadata-container">
        <p className="body2">{mapMetadata.title_short}</p>
        <p className="body1">{mapId}</p>
      </div>
    </li>
  );
}

MapEntry.propTypes = {
  mapId: PropTypes.oneOfType([PropTypes.string]),
  mapMetadata: PropTypes.object,
  onClick: PropTypes.func.isRequired,
};
