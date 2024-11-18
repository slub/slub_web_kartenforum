/*
 * Created by tom.schulze@pikobytes.de on 10.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRecoilValue } from "recoil";
import clsx from "clsx";

import { mapState, layoutState } from "@map/atoms";
import useGeoJsonFeature from "@map/hooks/useGeoJsonFeature.js";

import GeoJsonFeatureView from "./GeoJsonFeatureView";

const GeoJsonFeatureViewWithTransition = () => {
  const [isReadyToUnmount, setIsReadyToUnmount] = useState(false);

  const map = useRecoilValue(mapState);
  const layout = useRecoilValue(layoutState);

  const geoJsonProps = useGeoJsonFeature({
    map,
    layout,
  });

  const previousGeojsonProps = useRef(null);

  const keepAliveGeoJsonProps = useMemo(() => {
    if (geoJsonProps === null) {
      return previousGeojsonProps.current;
    }

    return geoJsonProps;
  }, [geoJsonProps]);

  const handleExitTransitionEnd = useCallback(() => {
    const exitTransitionCondition = geoJsonProps === null;
    if (exitTransitionCondition) {
      setIsReadyToUnmount(true);
    }
  }, [geoJsonProps]);

  useEffect(() => {
    previousGeojsonProps.current = geoJsonProps;

    return () => {
      setIsReadyToUnmount(false);
    };
  }, [geoJsonProps]);

  return (
    <div
      onTransitionEnd={handleExitTransitionEnd}
      className={clsx(
        "vkf-geojson-feature-view-root",
        geoJsonProps !== null && "in"
      )}
    >
      {!isReadyToUnmount && keepAliveGeoJsonProps !== null && (
        <GeoJsonFeatureView {...keepAliveGeoJsonProps} />
      )}
    </div>
  );
};

export default GeoJsonFeatureViewWithTransition;
