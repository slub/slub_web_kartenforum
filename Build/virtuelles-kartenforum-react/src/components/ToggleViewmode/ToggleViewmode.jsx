/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { useSetRecoilState } from "recoil";
import { map3dState } from "../../atoms/atoms";

export function ToggleViewmode(props) {
  const set3dViewState = useSetRecoilState(map3dState);

  const handleToggle = () => {
    set3dViewState((prevState) => !prevState);
  };

  return (
    <button
      style={{ position: "absolute", right: 0, top: 50, zIndex: 2 }}
      onClick={handleToggle}
    >
      Toggle
    </button>
  );
}

export default ToggleViewmode;
