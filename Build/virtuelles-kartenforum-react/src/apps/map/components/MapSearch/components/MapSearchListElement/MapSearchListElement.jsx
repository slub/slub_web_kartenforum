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
import Skeleton from "react-loading-skeleton";

import {
  mapSearchOverlayLayerState,
  olcsMapState,
  selectedFeaturesState,
} from "../../../../atoms/atoms";
import { isDefined, translate } from "../../../../../../util/util";
import { checkIfArrayContainsFeature } from "../../util";
import { LOADING_FEATURE } from "../MapSearchResultList/MapSearchResultList";
import "./MapSearchListElement.scss";

export const FALLBACK_SRC =
  "http://www.deutschefotothek.de/images/noimage/image120.jpg";

export const MapSearchListElement = ({ data, index, style }) => {
  const { direction, maps, is3d, onClick } = data;
  const operationalLayer = maps[index] ?? LOADING_FEATURE;

  const olcsMap = useRecoilValue(olcsMapState);
  const mapOverlayLayer = useRecoilValue(mapSearchOverlayLayerState);
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

  const handleError = () => {
    if (src !== "" && src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

  const handleMouseEnter = () => {
    if (isDefined(mapOverlayLayer)) {
      // clear old features and add hover feature
      mapOverlayLayer.getSource().clear();
      mapOverlayLayer.getSource().addFeature(operationalLayer);
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

  ///
  // Effect section
  ///

  // update thumb url if feature changes
  useEffect(() => {
    setSrc(operationalLayer.get("thumb_url"));
  }, [operationalLayer]);

  const isLoading = operationalLayer === LOADING_FEATURE;

  const isSelected =
    checkIfArrayContainsFeature(selectedFeatures, operationalLayer) &&
    !isLoading;

  const scale =
    operationalLayer.get("map_scale") === "0" ||
    operationalLayer.get("map_scale") === 0
      ? translate("mapsearch-listelement-unknown")
      : `1:${operationalLayer.get("map_scale")}`;

  return (
    <li
      style={style}
      className={clsx(
        "vkf-mapsearch-record",
        operationalLayer.get("maptype"),
        isSelected && "selected",
        direction,
        index % 2 === 1 && "odd",
        isLoading && "loading"
      )}
      id={operationalLayer.get("id")}
      onClick={isLoading ? undefined : handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="data-col time">
        {parseInt(operationalLayer.get("time_published"), 0)}
      </span>
      <span className="data-col title">{operationalLayer.get("title")}</span>
      <span className="data-col time">1</span>
      <div className="view-item">
        <a className="thumbnail" href="#">
          {src === "" ? (
            <Skeleton height="calc(100% - 6px)" />
          ) : (
            <img alt="Thumbnail Image of Map" onError={handleError} src={src} />
          )}
          {isSelected && (
            <span className="badge selected-badge">
              <span className="glyphicon glyphicon-ok" />{" "}
            </span>
          )}
        </a>
        <div className="overview">
          <h2>{isLoading ? <Skeleton /> : operationalLayer.get("title")}</h2>
          <div className="details">
            <div className="timestamp">
              {isLoading ? (
                <Skeleton />
              ) : (
                `${translate(
                  "mapsearch-listelement-time"
                )} ${operationalLayer.get("time_published")}`
              )}
            </div>
            <div className="scale">
              {isLoading ? (
                <Skeleton />
              ) : (
                `${translate("mapsearch-listelement-scale")} ${scale}`
              )}
            </div>
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

MapSearchListElement.propTypes = {
  data: PropTypes.shape({
    direction: PropTypes.oneOf(["horizontal", "vertical"]),
    feature: PropTypes.object,
    is3d: PropTypes.bool,
    onClick: PropTypes.func,
    maps: PropTypes.arrayOf(PropTypes.object),
    selected: PropTypes.bool,
  }),
  index: PropTypes.number,
  style: PropTypes.object,
};

export default MapSearchListElement;
