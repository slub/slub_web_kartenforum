/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { useRecoilState } from "recoil";

import { map3dState } from "../../atoms/atoms";
import "./ToggleViewMode.scss";

export function ToggleViewmode(props) {
  const [is3dView, set3dViewState] = useRecoilState(map3dState);

  const handleToggle = () => {
    set3dViewState((prevState) => !prevState);
  };

  return (
    <button
      className="switch-view-mode"
      id="button-view-mode-toggle"
      onClick={handleToggle}
    >
      {is3dView ? "2D" : "3D"}
    </button>
  );
}

export default ToggleViewmode;
