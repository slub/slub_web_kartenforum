/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import SpatialTemporalSearch from "../SpatialTemporalSearch/SpatialTemporalSearch";
import "./Sidebar.scss";

export const Sidebar = (props) => {
  return (
    <div className="sidebar">
      <SpatialTemporalSearch />
    </div>
  );
};

export default Sidebar;
