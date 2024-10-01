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
import React, { useCallback } from "react";
import { useRecoilValue } from "recoil";

import MapSearchListElementBase from "./MapSearchListElementBase.jsx";
import { isDefined } from "../../../../../../util/util.js";
import { mapState } from "../../../../atoms/atoms.js";
import { LOADING_LAYER } from "../MapSearchResultList/MapSearchResultListBase.jsx";
import { updateOverlayLayer } from "../MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";

export const MapSearchListElementWithGeometryPreview = (props) => {
  const { data, index } = props;
  const { maps } = data;
  const map = useRecoilValue(mapState);

  const operationalLayer = maps[index] ?? LOADING_LAYER;

  // @TODO: Rework search element parsing before implementing this correctly
  const handleMouseEnter = useCallback(() => {
    if (isDefined(map)) {
      updateOverlayLayer(map, operationalLayer.toGeoJSON());
    }
  }, [map, operationalLayer]);

  const handleMouseLeave = useCallback(() => {
    if (isDefined(map)) {
      updateOverlayLayer(map, {
        type: "FeatureCollection",
        features: [],
      });
    }
  }, [map, operationalLayer]);

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
