/*
 * Created by tom.schulze@pikobytes.de on 13.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";

import "./DangerZone.scss";

const DangerZoneBase = ({ children }) => {
  return (
    <div className="danger-zone-root">
      <p className="text text-header">danger zone</p>

      <div className="danger-zone-content">{children}</div>
    </div>
  );
};

DangerZoneBase.propTypes = {
  children: PropTypes.node,
};

export default DangerZoneBase;
