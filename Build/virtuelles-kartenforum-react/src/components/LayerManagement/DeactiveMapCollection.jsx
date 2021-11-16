/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { translate } from "../../util/util";
import { useRecoilValue } from "recoil";
import { getHistoricMapLayer } from "../MapWrapper/MapWrapper";
import { mapState } from "../../atoms/atoms";

export const DeactivateMapCollection = (props) => {
  const [isActive, setIsActive] = useState(true);
  const map = useRecoilValue(mapState);

  const handleClick = () => {
    const layers = getHistoricMapLayer(map);
    layers.forEach((layer) => {
      layer["setVisible"](!isActive);
    });
    setIsActive(!isActive);

    // @TODO: REFRESH 3d VIEW HERE
  };

  return (
    <div className="deactivate-map-col-control">
      <a
        onClick={handleClick}
        href="#"
        className={isActive ? "deactivate" : ""}
        title={translate(isActive ? "deactivatemap-all" : "activatemap-all")}
      >
        D
      </a>
    </div>
  );
};

export default DeactivateMapCollection;
