/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import clsx from "clsx";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { translate } from "../../../../../util/util";
import { mapState, selectedLayersState } from "../../../atoms/atoms";
import SvgIcons from "../../../../../components/SvgIcons/SvgIcons.jsx";
import { CustomEvents } from "../../VkfMap/constants";

import "./DeactivateMapCollection.scss";

export const DeactivateMapCollection = () => {
  const map = useRecoilValue(mapState);
  const [isActive, setIsActive] = useState(true);
  const selectedLayers = useRecoilValue(selectedLayersState);

  const title = translate(
    isActive
      ? "layermanagement-deactivate-all-maps"
      : "layermanagement-activate-all-maps"
  );

  const handleClick = useCallback(() => {
    selectedLayers.forEach((layer) => {
      layer.setVisibility(map, isActive ? "none" : "visible");
    });
  }, [map, isActive, selectedLayers]);

  useEffect(() => {
    if (map) {
      const handleLoad = () => {
        const isActive =
          selectedLayers.length === 0
            ? true
            : selectedLayers.some((layer) => layer.isVisible(map));

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

      map.on(CustomEvents.visibilityChanged, handleVisibilityChange);
      return () => {
        map.off(CustomEvents.visibilityChanged, handleVisibilityChange);
        map.off("load", handleLoad);
      };
    }
  }, [map, selectedLayers]);

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
