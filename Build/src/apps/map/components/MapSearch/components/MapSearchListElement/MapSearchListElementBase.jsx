/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import clsx from "clsx";
import { default as Skeleton } from "react-loading-skeleton/lib/skeleton";

import { selectedFeaturesState } from "../../../../atoms/atoms";
import { translate } from "../../../../../../util/util";
import { checkIfArrayContainsLayer } from "../../util";
import { LOADING_FEATURE } from "../MapSearchResultList/MapSearchResultListBase.jsx";
import "./MapSearchListElement.scss";

export const FALLBACK_SRC =
  "http://www.deutschefotothek.de/images/noimage/image120.jpg";

export const MapSearchListElementBase = ({
  children,
  data,
  index,
  onClick,
  onMouseEnter,
  onMouseLeave,
  style,
}) => {
  const { direction, maps } = data;
  const operationalLayer = maps[index] ?? LOADING_FEATURE;

  const selectedFeatures = useRecoilValue(selectedFeaturesState);
  const [src, setSrc] = useState(
    operationalLayer.get("thumb_url") === undefined
      ? ""
      : operationalLayer.get("thumb_url").replace("http:", "")
  );

  ////
  // Handler section
  ////

  const handleClick = () => {
    onClick(operationalLayer);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleClick();
    }
  };

  const handleError = () => {
    if (src !== "" && src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

  ///
  // Effect section
  ///

  // update thumb url if feature changes
  useEffect(() => {
    setSrc(operationalLayer.get("thumb_url"));
  }, [operationalLayer]);

  const isLoading = operationalLayer === LOADING_FEATURE;

  const isSelected =
    checkIfArrayContainsLayer(selectedFeatures, operationalLayer) && !isLoading;

  const scale =
    operationalLayer.get("map_scale") === "0" ||
    operationalLayer.get("map_scale") === 0
      ? translate("mapsearch-listelement-unknown")
      : `1:${operationalLayer.get("map_scale")}`;

  const timePublished = parseInt(operationalLayer.get("time_published"), 0);

  const isMosaicMap = operationalLayer.get("type") === "mosaic";

  return (
    <li
      tabIndex={0}
      style={style}
      className={clsx(
        "vkf-mapsearch-record",
        operationalLayer.get("map_type"),
        isSelected && "selected",
        direction,
        isLoading && "loading"
      )}
      id={operationalLayer.get("id")}
      onClick={isLoading ? undefined : handleClick}
      onKeyDown={isLoading ? undefined : handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <span className="data-col time">
        {isNaN(timePublished) ? "" : timePublished}
      </span>
      <span className="data-col title">{operationalLayer.get("title")}</span>
      <span className="data-col time">1</span>
      <div className="view-item">
        <span className="thumbnail" href="#">
          {src === "" ? (
            <Skeleton.default height="calc(100% - 6px)" />
          ) : (
            <img
              alt={`Thumbnail Image of Map ${operationalLayer.get(
                "title"
              )} ${operationalLayer.get("time_published")}`}
              onError={handleError}
              src={src}
            />
          )}
          {isSelected && (
            <span className="badge selected-badge">
              <span className="glyphicon glyphicon-ok" />{" "}
            </span>
          )}
        </span>
        <div className="overview">
          <h2>
            {isLoading ? <Skeleton.default /> : operationalLayer.get("title")}
          </h2>
          <div className="details">
            <div className="timestamp">
              {isLoading ? (
                <Skeleton.default />
              ) : (
                `${translate(
                  "mapsearch-listelement-time"
                )} ${operationalLayer.get("time_published")}`
              )}
            </div>
            <div className="scale">
              {isLoading ? (
                <Skeleton.default />
              ) : (
                `${translate("mapsearch-listelement-scale")} ${scale}`
              )}
            </div>
            {isMosaicMap && (
              <div className="type">
                {isLoading ? (
                  <Skeleton.default />
                ) : (
                  `${translate("originalview-title-mosaic")}`
                )}
              </div>
            )}
            {!operationalLayer.get("has_georeference") && (
              <div className="georeference">
                {translate("mapsearch-listelement-no-georef")}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

MapSearchListElementBase.propTypes = {
  children: PropTypes.element,
  data: PropTypes.shape({
    direction: PropTypes.oneOf(["horizontal", "vertical"]),
    feature: PropTypes.object,
    is3d: PropTypes.bool,
    maps: PropTypes.object,
    selected: PropTypes.bool,
  }),
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  index: PropTypes.number,
  style: PropTypes.object,
};

export default MapSearchListElementBase;
