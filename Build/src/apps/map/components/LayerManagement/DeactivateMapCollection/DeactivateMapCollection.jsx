/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { useRecoilValue } from "recoil";

import { translate } from "../../../../../util/util";
import { getHistoricMapLayer } from "../../MapWrapper/util";
import { mapState, olcsMapState } from "../../../atoms/atoms";
import "./DeactivateMapCollection.scss";

export const DeactivateMapCollection = () => {
  const [isActive, setIsActive] = useState(true);
  const map = useRecoilValue(mapState);
  const olcsMap = useRecoilValue(olcsMapState);

  const handleClick = () => {
    const layers = getHistoricMapLayer(map);
    layers.forEach((layer) => {
      layer["setVisible"](!isActive);
    });
    setIsActive(!isActive);

    if (olcsMap !== undefined) {
      olcsMap.getAutoRenderLoop().restartRenderLoop();
    }
  };

  return (
    <div className="deactivate-map-col-control">
      <a
        onClick={handleClick}
        href="#"
        className={isActive ? "deactivate" : ""}
        title={translate(
          isActive
            ? "layermanagement-deactivate-all-maps"
            : "layermanagement-activate-all-maps"
        )}
      >
        D
      </a>
    </div>
  );
};

export default DeactivateMapCollection;
