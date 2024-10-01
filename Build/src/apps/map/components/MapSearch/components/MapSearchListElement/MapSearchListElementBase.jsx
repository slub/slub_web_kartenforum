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

import { selectedLayersState } from "../../../../atoms/atoms";
import { translate } from "../../../../../../util/util";
import { checkIfArrayContainsLayer } from "../../util";
import { LOADING_LAYER } from "../MapSearchResultList/MapSearchResultListBase.jsx";
import "./MapSearchListElement.scss";
import { METADATA } from "../../../CustomLayers";

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
  const operationalLayer = maps[index] ?? LOADING_LAYER;

  const selectedLayers = useRecoilValue(selectedLayersState);
  const [src, setSrc] = useState(
    operationalLayer.getMetadata(METADATA.thumbnailUrl) === undefined
      ? ""
      : operationalLayer.getMetadata(METADATA.thumbnailUrl).replace("http:", "")
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

  // update thumb url if layer changes
  useEffect(() => {
    setSrc(operationalLayer.getMetadata(METADATA.thumbnailUrl));
  }, [operationalLayer]);

  const isLoading = operationalLayer === LOADING_LAYER;

  const isSelected =
    checkIfArrayContainsLayer(selectedLayers, operationalLayer) && !isLoading;

  const scale =
    operationalLayer.getMetadata(METADATA.mapScale) === "0" ||
    operationalLayer.getMetadata(METADATA.mapScale) === 0
      ? translate("mapsearch-listelement-unknown")
      : `1:${operationalLayer.getMetadata(METADATA.mapScale)}`;

  const timePublished = parseInt(
    operationalLayer.getMetadata(METADATA.timePublished),
    0
  );

  const isMosaicMap = operationalLayer.getMetadata(METADATA.type) === "mosaic";

  return (
    <li
      tabIndex={0}
      style={style}
      className={clsx(
        "vkf-mapsearch-record",
        operationalLayer.getMetadata(METADATA.type),
        isSelected && "selected",
        direction,
        isLoading && "loading"
      )}
      id={operationalLayer.getMetadata(METADATA.id)}
      onClick={isLoading ? undefined : handleClick}
      onKeyDown={isLoading ? undefined : handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <span className="data-col time">
        {isNaN(timePublished) ? "" : timePublished}
      </span>
      <span className="data-col title">
        {operationalLayer.getMetadata(METADATA.title)}
      </span>
      <span className="data-col time">1</span>
      <div className="view-item">
        <span className="thumbnail" href="#">
          {src === "" ? (
            <Skeleton.default height="calc(100% - 6px)" />
          ) : (
            <img
              alt={`Thumbnail Image of Map ${operationalLayer.getMetadata(
                METADATA.title
              )} ${operationalLayer.getMetadata(METADATA.timePublished)}`}
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
            {isLoading ? (
              <Skeleton.default />
            ) : (
              operationalLayer.getMetadata(METADATA.title)
            )}
          </h2>
          <div className="details">
            <div className="timestamp">
              {isLoading ? (
                <Skeleton.default />
              ) : (
                `${translate(
                  "mapsearch-listelement-time"
                )} ${operationalLayer.getMetadata(METADATA.timePublished)}`
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
            {!operationalLayer.getMetadata(METADATA.hasGeoReference) && (
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
