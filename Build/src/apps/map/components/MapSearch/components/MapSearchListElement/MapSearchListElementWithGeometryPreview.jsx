/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilValue } from "recoil";

import MapSearchListElementBase from "./MapSearchListElementBase.jsx";
import { isDefined } from "../../../../../../util/util.js";
import {
  mapSearchOverlayLayerState,
  olcsMapState,
} from "../../../../atoms/atoms.js";
import { LOADING_FEATURE } from "../MapSearchResultList/MapSearchResultListBase.jsx";

export const MapSearchListElementWithGeometryPreview = (props) => {
  const { data, index } = props;
  const { maps, is3d } = data;
  const olcsMap = useRecoilValue(olcsMapState);
  const mapOverlayLayer = useRecoilValue(mapSearchOverlayLayerState);
  const operationalLayer = maps[index] ?? LOADING_FEATURE;

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

  return (
    <MapSearchListElementBase
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  );
};

MapSearchListElementWithGeometryPreview.propTypes = {
  ...MapSearchListElementBase.propTypes,
};

export default MapSearchListElementWithGeometryPreview;
