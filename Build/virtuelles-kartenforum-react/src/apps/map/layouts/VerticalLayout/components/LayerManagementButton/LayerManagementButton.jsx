/**
 * Created by nicolas.looschen@pikobytes.de on 02.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import clsx from "clsx";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";

import { displayedLayersCountState } from "../../../../atoms/atoms";
import "./LayerManagementButton.scss";

export const LayerManagementButton = ({ buttonState, onClick }) => {
  const displayedLayerCount = useRecoilValue(displayedLayersCountState);

  const disabled = displayedLayerCount === 0;

  return (
    <div
      className={clsx(
        "vkf-toggle-layermanagement-container",
        !disabled && buttonState && "opened",
        disabled && "disabled"
      )}
    >
      {!disabled && <span className="badge">{displayedLayerCount}</span>}
      <button
        className="toggle-layermanagement-button"
        disabled={disabled}
        onClick={onClick}
      >
        L
      </button>
    </div>
  );
};

LayerManagementButton.propTypes = {
  buttonState: PropTypes.bool,
  onClick: PropTypes.func,
};

export default LayerManagementButton;
