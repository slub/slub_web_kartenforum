/**
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";

import BaseOverlayLayer from "@components/BaseOverlayLayer";

export const MAP_OVERLAY_SOURCE_ID = "vkf-map-overlay-source";
export const MAP_OVERLAY_FILL_ID = "vkf-map-overlay-fill";
export const MAP_OVERLAY_OUTLINE_ID = "vkf-map-overlay-outline";

export const updateOverlayLayer = (map, data) => {
  const source = map.getSource(MAP_OVERLAY_SOURCE_ID);
  if (source) {
    source.setData(data);
  }
};

export const MapSearchOverlayLayer = () => {
  return (
    <>
      <BaseOverlayLayer
        sourceId={MAP_OVERLAY_SOURCE_ID}
        fillId={MAP_OVERLAY_FILL_ID}
        outlineId={MAP_OVERLAY_OUTLINE_ID}
      />
    </>
  );
};

MapSearchOverlayLayer.propTypes = {};

export default MapSearchOverlayLayer;
