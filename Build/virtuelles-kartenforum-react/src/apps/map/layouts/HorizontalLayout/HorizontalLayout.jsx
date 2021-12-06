/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { DetachedLayerManagement } from "../../components/LayerManagement/LayerManagement";

import SpatialTemporalSearch from "../../components/SpatialTemporalSearch/SpatialTemporalSearch";
import "./HorizontalLayout.scss";

export const HorizontalLayout = () => {
  return (
    <div className="vkf-horizontal-layout">
      <div className="spatialsearch-container" id="spatialsearch-container">
        <SpatialTemporalSearch />
      </div>
      <DetachedLayerManagement />
    </div>
  );
};
