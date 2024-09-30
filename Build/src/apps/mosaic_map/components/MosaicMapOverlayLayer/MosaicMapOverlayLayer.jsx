/*
 * Created by tom.schulze@pikobytes.de on 30.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";

import BaseOverlayLayer from "../../../../components/BaseOverlayLayer";

export const MOSAIC_MAP_OVERLAY_SOURCE_ID = "mosaic-map-overlay-source";
export const MOSAIC_MAP_OVERLAY_FILL_ID = "mosaic-map-overlay-fill";
export const MOSAIC_MAP_OVERLAY_OUTLINE_ID = "mosaic-map-overlay-outline";

/**
 * Moves only the outline style layer of the mosaic overlay layer to the top.
 * @param {maplibregl.Map} map
 */
export const moveMosaicOverlayToTop = (map) => {
  map.moveLayer(MOSAIC_MAP_OVERLAY_OUTLINE_ID);
};

/**
 * Resets the mosaic overlay source layer to an empty feature collection.
 * @param {maplibregl.Map} map
 */
export const resetMosaicOverlaySource = (map) => {
  const emptyFeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  const source = map.getSource(MOSAIC_MAP_OVERLAY_SOURCE_ID);
  if (source) {
    source.setData(emptyFeatureCollection);
  }
};

export const MapSearchOverlayLayer = () => {
  return (
    <>
      <BaseOverlayLayer
        sourceId={MOSAIC_MAP_OVERLAY_SOURCE_ID}
        fillId={MOSAIC_MAP_OVERLAY_FILL_ID}
        outlineId={MOSAIC_MAP_OVERLAY_OUTLINE_ID}
      />
    </>
  );
};

MapSearchOverlayLayer.propTypes = {};

export default MapSearchOverlayLayer;
