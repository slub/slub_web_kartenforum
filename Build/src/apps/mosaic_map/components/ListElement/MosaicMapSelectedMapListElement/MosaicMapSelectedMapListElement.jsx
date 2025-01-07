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
import { useRecoilState, useRecoilValue } from "recoil";
import clsx from "clsx";
import { default as Skeleton } from "react-loading-skeleton/lib/skeleton";
import { Glyphicon } from "react-bootstrap";

import { LOADING_LAYER } from "@map/components/MapSearch/components/MapSearchResultList/MapSearchResultListBase.jsx";
import { mosaicMapSelectedLayersState } from "@mosaic-map/atoms";
import { mapState, selectedLayersState } from "@map/atoms";
import { translate } from "@util/util.js";

import "@map/components/MapSearch/components/MapSearchListElement/MapSearchListElement.scss";
import "./MosaicMapSelectedMapListElement.scss";
import { METADATA } from "@map/components/CustomLayers";
import { checkIfArrayContainsLayer } from "@map/components/MapSearch/util.js";
import { MOSAIC_MAP_OVERLAY_SOURCE_ID } from "@mosaic-map/components/MosaicMapOverlayLayer/MosaicMapOverlayLayer.jsx";
import { fetchWmsTmsSettings } from "@map/components/CustomLayers/HistoricMapLayer/fetchWmsTmsSettings";

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
  const map = useRecoilValue(mapState);
  const [selectedMosaicLayers, setSelectedMosaicLayers] = useRecoilState(
    mosaicMapSelectedLayersState
  );
  const [selectedLayers, setSelectedLayers] =
    useRecoilState(selectedLayersState);

  const operationalLayer = maps[index] ?? LOADING_LAYER;
  const selectedLayer = selectedMosaicLayers.find(
    (selectedLayer) => selectedLayer.getId() === operationalLayer.getId()
  );
  const [src, setSrc] = useState(
    operationalLayer.getMetadata(METADATA.thumbnailUrl) === undefined
      ? ""
      : operationalLayer.getMetadata(METADATA.thumbnailUrl).replace("http:", "")
  );

  // derived state
  const isLoading = operationalLayer === LOADING_LAYER;

  const isMissing = operationalLayer.isMissing();

  const isSelected = selectedLayer?.isDisplayedInMap(map);

  const scale =
    operationalLayer.getMetadata(METADATA.mapScale) === "0" ||
    operationalLayer.getMetadata(METADATA.mapScale) === 0
      ? translate("mapsearch-listelement-unknown")
      : `1:${operationalLayer.getMetadata(METADATA.mapScale)}`;

  const timePublished = parseInt(
    operationalLayer.getMetadata(METADATA.timePublished),
    0
  );

  ////
  // Handler section
  ////

  const handleClick = (e) => {
    e.stopPropagation();

    const containsLayer = checkIfArrayContainsLayer(
      selectedLayers,
      selectedLayer
    );

    // remove layer if it is already contained
    if (containsLayer) {
      setSelectedLayers((selectedLayers) =>
        selectedLayers.filter(
          (layer) => layer.getId() !== selectedLayer.getId()
        )
      );
      selectedLayer.removeMapLibreLayers(map);
    } else {
      //@TODO: Add loading feedback, while layer is added to map
      fetchWmsTmsSettings(selectedLayer).then((sourceSettings) => {
        selectedLayer.addLayerToMap(map, { sourceSettings });
        setSelectedLayers((selectedLayers) => [
          ...selectedLayers,
          selectedLayer,
        ]);
      });
    }
  };

  const handleError = () => {
    if (src !== "" && src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedMosaicLayers((oldSelectedLayers) =>
      oldSelectedLayers.filter(
        (selectedLayer) => selectedLayer.getId() !== operationalLayer.getId()
      )
    );
    selectedLayer.removeFromOverlay(map, MOSAIC_MAP_OVERLAY_SOURCE_ID);
  };

  ///
  // Effect section
  ///

  // update thumb url if layer changes
  useEffect(() => {
    setSrc(operationalLayer.getMetadata(METADATA.thumbnailUrl));
  }, [operationalLayer]);

  return (
    <li
      tabIndex={0}
      style={style}
      className={clsx(
        "vkf-mapsearch-record",
        "vkf-mosaic-map-selected-list-element",
        operationalLayer.getType(),
        isSelected && "selected",
        direction,
        isLoading && "loading",
        isMissing && "missing"
      )}
      id={operationalLayer.getId()}
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
        {!isMissing && (
          <span className="thumbnail">
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
              operationalLayer.getMetadata(METADATA.title)
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
              </>
            )}
            {!operationalLayer.getMetadata(METADATA.hasGeoReference) && (
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
