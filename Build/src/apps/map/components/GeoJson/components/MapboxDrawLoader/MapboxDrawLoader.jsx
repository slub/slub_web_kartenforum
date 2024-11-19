/*
 * Created by tom.schulze@pikobytes.de on 19.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import { isDefined } from "@util/util";
import { mapState, drawState, selectedGeoJsonLayerState } from "@map/atoms";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./MapboxDrawLoader.scss";

const options = {
  controls: {
    combine_features: false,
    uncombine_features: false,
  },
};

const MapboxDrawLoader = () => {
  const map = useRecoilValue(mapState);
  const setDraw = useSetRecoilState(drawState);
  const { selectedLayer } = useRecoilValue(selectedGeoJsonLayerState);

  useEffect(() => {
    if (isDefined(map) && isDefined(selectedLayer)) {
      const draw = new MapboxDraw(options);
      setDraw(draw);
      map.addControl(draw, "top-right");

      const geoJson = selectedLayer.getGeoJson();
      draw.add(geoJson);

      return () => {
        map.removeControl(draw);
        setDraw(undefined);
      };
    }
  }, []);

  return null;
};

export default MapboxDrawLoader;
