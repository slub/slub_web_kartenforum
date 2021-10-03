/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { Fragment, useEffect } from "react";
import { useRecoilState } from "recoil";

import { map3dState } from "../../atoms/atoms";
import "./ToggleViewMode.scss";
import ReactDOM, { unmountComponentAtNode } from "react-dom";

// @TODO: Inject this from typo3 context
const SWITCH_VIEW_MODE_CONTAINER_ID = "switch-view-mode-container";

export function ToggleViewmode(props) {
  const [is3dView, set3dViewState] = useRecoilState(map3dState);

  const container = document.getElementById(SWITCH_VIEW_MODE_CONTAINER_ID);

  const handleToggle = () => {
    set3dViewState((prevState) => !prevState);
  };

  // render the button into the typo3 supplied container
  useEffect(() => {
    ReactDOM.render(
      <button
        className="switch-view-mode"
        id="button-view-mode-toggle"
        onClick={handleToggle}
      >
        {is3dView ? "2D" : "3D"}
      </button>,
      container
    );

    return () => {
      unmountComponentAtNode(container);
    };
  }, [is3dView]);

  return <Fragment />;
}

export default ToggleViewmode;
