/*
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 * Turned into base component by tom.schulze@pikobytes.de on 26.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";

// TODO maybe it makes sense to move map atom into global atoms as its shared by map and mosaic map anyhow
import { mapState } from "../../apps/map/atoms/atoms";
import { isDefined } from "../../util/util";
import PropTypes from "prop-types";

const addOverlayLayer = (map, { sourceId, fillId, outlineId }) => {
  map.addSource(sourceId, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer({
    id: fillId,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": "#ff0000",
      "fill-opacity": 0.2,
    },
  });

  map.addLayer({
    id: outlineId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": "#ff0000",
      "line-width": 1,
    },
  });
};

const removeOverlayLayer = (map, { sourceId, fillId, outlineId }) => {
  if (map.getLayer(fillId)) {
    map.removeLayer(fillId);
  }

  if (map.getLayer(outlineId)) {
    map.removeLayer(outlineId);
  }

  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
};

export const MapSearchOverlayLayer = (props) => {
  // State
  const map = useRecoilValue(mapState);

  ////
  // Effect section
  ////

  useEffect(() => {
    if (isDefined(map)) {
      const handleLoad = () => {
        addOverlayLayer(map, { ...props });
      };

      if (map._loaded) {
        addOverlayLayer(map, { ...props });
      } else {
        map.once("load", handleLoad);
      }

      return () => {
        removeOverlayLayer(map, { ...props });
        map.off("load", handleLoad);
      };
    }
  }, [map]);

  return <></>;
};

MapSearchOverlayLayer.propTypes = {
  sourceId: PropTypes.string.isRequired,
  fillId: PropTypes.string.isRequired,
  outlineId: PropTypes.string.isRequired,
};

export default MapSearchOverlayLayer;
