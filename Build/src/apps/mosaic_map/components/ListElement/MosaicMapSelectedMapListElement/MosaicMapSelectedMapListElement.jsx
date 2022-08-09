/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilState } from "recoil";
import clsx from "clsx";
import { default as Skeleton } from "react-loading-skeleton/lib/skeleton";
import { Glyphicon } from "react-bootstrap";

import { LOADING_FEATURE } from "../../../../map/components/MapSearch/components/MapSearchResultList/MapSearchResultListBase.jsx";
import { mosaicMapSelectedFeaturesState } from "../../../atoms/atoms.js";
import { translate } from "../../../../../util/util.js";

import "../../../../map/components/MapSearch/components/MapSearchListElement/MapSearchListElement.scss";
import "./MosaicMapSelectedMapListElement.scss";

export const FALLBACK_SRC =
  "http://www.deutschefotothek.de/images/noimage/image120.jpg";

export const MosaicMapSelectedMapListElement = ({
  children,
  data,
  index,
  onMouseEnter,
  onMouseLeave,
  style,
}) => {
  const { direction, maps } = data;
  const operationalLayer = maps[index] ?? LOADING_FEATURE;
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    mosaicMapSelectedFeaturesState
  );
  const selectedFeature = selectedFeatures.find(
    (selectedFeature) =>
      selectedFeature.feature.getId() === operationalLayer.getId()
  );
  const [src, setSrc] = useState(
    operationalLayer.get("thumb_url") === undefined
      ? ""
      : operationalLayer.get("thumb_url").replace("http:", "")
  );

  // derived state
  const isLoading = operationalLayer === LOADING_FEATURE;

  const isMissing = operationalLayer.get("isMissing");

  const isSelected = selectedFeature?.showPreview;

  const scale =
    operationalLayer.get("map_scale") === "0" ||
    operationalLayer.get("map_scale") === 0
      ? translate("mapsearch-listelement-unknown")
      : `1:${operationalLayer.get("map_scale")}`;

  const timePublished = parseInt(operationalLayer.get("time_published"), 0);

  ////
  // Handler section
  ////

  const handleClick = (e) => {
    e.stopPropagation();

    setSelectedFeatures((oldSelectedFeatures) => {
      const newSelectedFeatures = oldSelectedFeatures.slice();
      const oldFeatureIndex = newSelectedFeatures.findIndex(
        (selectedFeature) =>
          selectedFeature.feature.getId() === operationalLayer.getId()
      );
      const oldFeature = newSelectedFeatures[oldFeatureIndex];

      newSelectedFeatures.splice(oldFeatureIndex, 1, {
        ...oldFeature,
        showPreview: !oldFeature.showPreview,
      });

      return newSelectedFeatures;
    });
  };

  const handleError = () => {
    if (src !== "" && src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedFeatures((oldSelectedFeatures) =>
      oldSelectedFeatures.filter(
        (selectedFeature) =>
          selectedFeature.feature.getId() !== operationalLayer.getId()
      )
    );
  };

  ///
  // Effect section
  ///

  // update thumb url if feature changes
  useEffect(() => {
    setSrc(operationalLayer.get("thumb_url"));
  }, [operationalLayer]);

  return (
    <li
      tabIndex={0}
      style={style}
      className={clsx(
        "vkf-mapsearch-record",
        "vkf-mosaic-map-selected-list-element",
        operationalLayer.get("maptype"),
        isSelected && "selected",
        direction,
        isLoading && "loading",
        isMissing && "missing"
      )}
      id={operationalLayer.get("id")}
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
        {!isMissing && (
          <span className="thumbnail">
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
          </span>
        )}
        <div className="overview">
          <h2>
            {isLoading ? (
              <Skeleton.default />
            ) : isMissing ? (
              `${translate(
                "mosaic-map-missing-sheet"
              )}: ${operationalLayer.getId()}`
            ) : (
              operationalLayer.get("title")
            )}
          </h2>
          <div className="details">
            {!isMissing && (
              <>
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
              </>
            )}
            {!operationalLayer.get("has_georeference") && (
              <div className="georeference">
                {translate("mapsearch-listelement-no-georef")}
              </div>
            )}
          </div>
        </div>
        <div className="actions">
          {!isMissing && (
            <button className="vkf-mosaic-map-preview" onClick={handleClick}>
              <Glyphicon glyph={isSelected ? "eye-open" : "eye-close"} />
            </button>
          )}
          <button className="vkf-mosaic-map-delete" onClick={handleRemove}>
            <Glyphicon glyph="trash" />
          </button>
        </div>
      </div>
    </li>
  );
};

MosaicMapSelectedMapListElement.propTypes = {
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

export default MosaicMapSelectedMapListElement;
