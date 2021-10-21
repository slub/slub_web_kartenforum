/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { isDefined, translate } from "../../util/util";
import { useRecoilValue } from "recoil";
import { olcsMapState } from "../../atoms/atoms";

const FALLBACK_SRC =
  "http://www.deutschefotothek.de/images/noimage/image120.jpg";

export const MapSearchListElement = (props) => {
  const { feature, featureOverlay, is3d, onClick } = props;
  const olcsMap = useRecoilValue(olcsMapState);
  const [src, setSrc] = useState(feature.get("thumb").replace("http:", ""));
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick(feature);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
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
    setIsHovered(false);
    if (isDefined(featureOverlay)) {
      featureOverlay.getSource().clear();
    }
  };

  const handleError = () => {
    if (src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

  const scale =
    feature.get("denominator") === "0" || feature.get("denominator") === 0
      ? "unknown"
      : `1:${feature.get("denominator")}`;

  return (
    <li
      className={`mapsearch-record type ${feature.get("maptype")}`}
      id={feature.get("id")}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="data-col time">{parseInt(feature.get("time"), 0)}</span>
      <span className="data-col title">{feature.get("title")}</span>
      <span className="data-col time">1</span>
      <div className="view-item">
        <a className="thumbnail" href="#">
          <img alt="Thumbnail Image of Map" onError={handleError} src={src} />
        </a>
        <div className="overview">
          <h2>{feature.get("title")}</h2>
          <p className="details">
            <div className="timestamp">{`${translate("time")} ${feature.get(
              "time"
            )}`}</div>
            <div className="scale">{`${translate(
              "factory-scale"
            )} ${scale}`}</div>
            {!feature.get("georeference") && (
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

export default MapSearchListElement;
