/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";

import { olcsMapState } from "../../atoms/atoms";
import { isDefined, translate } from "../../util/util";
import "./MapSearchListElement.scss";

export const FALLBACK_SRC =
  "http://www.deutschefotothek.de/images/noimage/image120.jpg";

// @TODO: Rename feature to something less ambiguous
export const MapSearchListElement = (props) => {
  const { feature, featureOverlay, is3d, onClick, selected } = props;
  const olcsMap = useRecoilValue(olcsMapState);
  const [src, setSrc] = useState(feature.get("thumb_url").replace("http:", ""));

  ////
  // Effect section
  ////

  const handleClick = () => {
    onClick(feature);
  };

  const handleError = () => {
    if (src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

  const handleMouseEnter = () => {
    if (isDefined(featureOverlay)) {
      // clear old features and add hover feature
      featureOverlay.getSource().clear();
      featureOverlay.getSource().addFeature(feature);
      if (is3d && olcsMap !== undefined) {
        // for updating the vector layer
        olcsMap.getAutoRenderLoop().restartRenderLoop();
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDefined(featureOverlay)) {
      featureOverlay.getSource().clear();
    }
  };

  const scale =
    feature.get("map_scale") === "0" || feature.get("map_scale") === 0
      ? "unknown"
      : `1:${feature.get("map_scale")}`;

  return (
    <li
      className={`mapsearch-record type ${feature.get("map_type")} ${
        selected ? "selected" : ""
      }`}
      id={feature.get("id")}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="data-col time">
        {parseInt(feature.get("time_published"), 0)}
      </span>
      <span className="data-col title">{feature.get("title")}</span>
      <span className="data-col time">1</span>
      <div className="view-item">
        <a className="thumbnail" href="#">
          <img alt="Thumbnail Image of Map" onError={handleError} src={src} />
          {selected && (
            <span className="badge selected-badge">
              <span className="glyphicon glyphicon-ok" />{" "}
            </span>
          )}
        </a>
        <div className="overview">
          <h2>{feature.get("title")}</h2>
          <p className="details">
            <div className="timestamp">{`${translate("time")} ${feature.get(
              "time_published"
            )}`}</div>
            <div className="scale">{`${translate(
              "factory-scale"
            )} ${scale}`}</div>
            {!feature.get("has_georeference") && (
              <div className="georeference">
                {translate("factory-no-georef")}
              </div>
            )}
          </p>
        </div>
      </div>
    </li>
  );
};

MapSearchListElement.propTypes = {
  feature: PropTypes.object,
  featureOverlay: PropTypes.object,
  is3d: PropTypes.bool,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};

export default MapSearchListElement;
