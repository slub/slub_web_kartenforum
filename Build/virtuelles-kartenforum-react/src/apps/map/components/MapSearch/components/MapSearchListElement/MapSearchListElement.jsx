/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import clsx from "clsx";

import {
  mapSearchOverlayLayerState,
  olcsMapState,
} from "../../../../atoms/atoms";
import { isDefined, translate } from "../../../../../../util/util";
import "./MapSearchListElement.scss";

export const FALLBACK_SRC =
  "http://www.deutschefotothek.de/images/noimage/image120.jpg";

// @TODO: Rename feature to something less ambiguous
export const MapSearchListElement = (props) => {
  const { direction, feature, is3d, onClick, selected } = props;
  const olcsMap = useRecoilValue(olcsMapState);
  const mapOverlayLayer = useRecoilValue(mapSearchOverlayLayerState);
  const [src, setSrc] = useState(feature.get("thumb_url").replace("http:", ""));

  ////
  // Handler section
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
    if (isDefined(mapOverlayLayer)) {
      // clear old features and add hover feature
      mapOverlayLayer.getSource().clear();
      mapOverlayLayer.getSource().addFeature(feature);
      if (is3d && olcsMap !== undefined) {
        // for updating the vector layer
        olcsMap.getAutoRenderLoop().restartRenderLoop();
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDefined(mapOverlayLayer)) {
      mapOverlayLayer.getSource().clear();
    }
  };

  const scale =
    feature.get("map_scale") === "0" || feature.get("map_scale") === 0
      ? "unknown"
      : `1:${feature.get("map_scale")}`;

  return (
    <li
      className={clsx(
        "vkf-mapsearch-record",
        feature.get("maptype"),
        selected && "selected",
        direction
      )}
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
  direction: PropTypes.oneOf(["horizontal", "vertical"]),
  feature: PropTypes.object,
  is3d: PropTypes.bool,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};

export default MapSearchListElement;
