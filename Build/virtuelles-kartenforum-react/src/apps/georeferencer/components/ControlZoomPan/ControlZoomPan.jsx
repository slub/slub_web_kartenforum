/**
 * Created by jacob.mendt@pikobytes.de on 16.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { translate } from "../../../../util/util";

export const ControlZoomPanId = "control-zoom-pan";
export const ControlZoomPan = (props) => {
  const { className = "", onClick } = props;

  // Handle click event
  const handleClick = () => {
    onClick(ControlZoomPanId);
  };

  return (
    <div className={clsx("vkf-header-control", ControlZoomPanId, className)}>
      <button className="btn btn-default btn-vkf-control" onClick={handleClick}>
        <span className="text">{translate("georef-movemap")}</span>
        <span className="icon" />
      </button>
    </div>
  );
};

ControlZoomPan.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default ControlZoomPan;
