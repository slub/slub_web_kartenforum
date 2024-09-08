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
import {
  mapSearchOverlayLayerState,
  mapState,
} from "../../../../atoms/atoms.js";
import { LOADING_FEATURE } from "../MapSearchResultList/MapSearchResultListBase.jsx";
import GeoJSON from "ol/format/GeoJSON";
import { updateOverlayLayer } from "../MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";

const geoJsonFormat = new GeoJSON();

export const MapSearchListElementWithGeometryPreview = (props) => {
  const { data, index } = props;
  const { maps, is3d } = data;
  const map = useRecoilValue(mapState);

  const mapOverlayLayer = useRecoilValue(mapSearchOverlayLayerState);
  const operationalLayer = maps[index] ?? LOADING_FEATURE;

  // @TODO: Rework search element parsing before implementing this correctly
  const handleMouseEnter = useCallback(() => {
    if (isDefined(map)) {
      console.log(operationalLayer);
      const geometry = geoJsonFormat.writeFeature(operationalLayer);
      const geometryElement = JSON.parse(geometry);
      updateOverlayLayer(map, geometryElement);
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
