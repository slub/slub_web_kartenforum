/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import clsx from "clsx";
import { translate } from "../../../../../util/util";
import { mapState, selectedFeaturesState } from "../../../atoms/atoms";
import "./DeactivateMapCollection.scss";
import SvgIcons from "../../../../../components/SvgIcons/SvgIcons.jsx";
import customEvents from "../../MapWrapper/customEvents.js";

export const DeactivateMapCollection = () => {
  const map = useRecoilValue(mapState);
  const [isActive, setIsActive] = useState(true);
  const selectedFeatures = useRecoilValue(selectedFeaturesState);

  const title = translate(
    isActive
      ? "layermanagement-deactivate-all-maps"
      : "layermanagement-activate-all-maps"
  );

  const handleClick = useCallback(() => {
    selectedFeatures.forEach((layer) => {
      layer.setVisibility(map, isActive ? "none" : "visible");
    });
  }, [map, isActive, selectedFeatures]);

  useEffect(() => {
    if (map) {
      const handleLoad = () => {
        const isActive =
          selectedFeatures.length === 0
            ? true
            : selectedFeatures.some((layer) => layer.isVisible(map));

        setIsActive(isActive);
      };

      const handleVisibilityChange = () => {
        handleLoad();
      };

      if (map._loaded) {
        handleLoad();
      } else {
        map.on("load", handleLoad);
      }

      map.on(customEvents.visibilityChanged, handleVisibilityChange);
      map.on(customEvents.layerAdded, handleVisibilityChange);
      return () => {
        map.off(customEvents.visibilityChanged, handleVisibilityChange);
        map.off(customEvents.layerAdded, handleVisibilityChange);
        map.off("load", handleLoad);
      };
    }
  }, [map, selectedFeatures]);

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "deactivate-map-col-control",
        isActive ? "deactivate" : ""
      )}
      title={title}
      id="deactivate-all-maps"
    >
      <SvgIcons
        name="layermanagement-deactivate"
        aria-labelledby="deactivate-all-maps"
        alt={title}
      />
    </button>
  );
};

export default DeactivateMapCollection;
