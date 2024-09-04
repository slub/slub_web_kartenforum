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
import { mapState } from "../../../atoms/atoms";
import "./DeactivateMapCollection.scss";
import SvgIcons from "../../../../../components/SvgIcons/SvgIcons.jsx";
import { getLayers } from "../util.js";
import customEvents from "../../MapWrapper/customEvents.js";

export const DeactivateMapCollection = () => {
  const map = useRecoilValue(mapState);
  const [isActive, setIsActive] = useState(true);

  const title = translate(
    isActive
      ? "layermanagement-deactivate-all-maps"
      : "layermanagement-activate-all-maps"
  );

  const handleClick = useCallback(() => {
    const layers = getLayers(map);
    layers.forEach((layer) => {
      map.setLayoutProperty(
        layer.id,
        "visibility",
        isActive ? "none" : "visible"
      );
    });
  }, [map, isActive]);

  useEffect(() => {
    if (map) {
      const handleLoad = () => {
        const layers = getLayers(map);
        const isActive =
          layers.length === 0
            ? true
            : layers.some(
                (layer) =>
                  layer?.layout?.visibility === undefined ||
                  layer.layout.visibility === "visible"
              );

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
  }, [map]);

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
