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
import SvgIcons from "@components/SvgIcons";

import { selectedLayersState } from "@map/atoms";
import "./LayerManagementButton.scss";

export const LayerManagementButton = ({ buttonState, onClick }) => {
  const selectedLayers = useRecoilValue(selectedLayersState);

  const disabled = selectedLayers.length === 0;

  return (
    <button
      className={clsx(
        "vkf-toggle-layermanagement-button",
        !disabled && buttonState && "opened",
        disabled && "disabled"
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {!disabled && <span className="badge">{selectedLayers.length}</span>}
      <SvgIcons name="layers" />
    </button>
  );
};

LayerManagementButton.propTypes = {
  buttonState: PropTypes.bool,
  onClick: PropTypes.func,
};

export default LayerManagementButton;
