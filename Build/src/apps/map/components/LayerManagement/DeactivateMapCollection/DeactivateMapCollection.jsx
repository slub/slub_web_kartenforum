/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { useRecoilValue } from "recoil";

import clsx from "clsx";
import { translate } from "../../../../../util/util";
import { getOperationalLayers } from "../../MapWrapper/util";
import { mapState, olcsMapState } from "../../../atoms/atoms";
import "./DeactivateMapCollection.scss";
import SvgIcons from "../../../../../components/SvgIcons/SvgIcons.jsx";

export const DeactivateMapCollection = () => {
  const [isActive, setIsActive] = useState(true);
  const map = useRecoilValue(mapState);
  const olcsMap = useRecoilValue(olcsMapState);
  const title = translate(
    isActive
      ? "layermanagement-deactivate-all-maps"
      : "layermanagement-activate-all-maps"
  );

  const handleClick = () => {
    const layers = getOperationalLayers(map);
    layers.forEach((layer) => {
      layer["setVisible"](!isActive);
    });
    setIsActive(!isActive);

    if (olcsMap !== undefined) {
      olcsMap.getAutoRenderLoop().restartRenderLoop();
    }
  };

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
