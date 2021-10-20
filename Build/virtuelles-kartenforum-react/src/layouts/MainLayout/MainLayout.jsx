/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import MapWrapper from "../../components/MapWrapper/MapWrapper";
import { SettingsProvider } from "../../index";
import ToggleViewmode from "../../components/ToggleViewmode/ToggleViewmode";
import SpatialTemporalSearch from "../../components/SpatialTemporalSearch/SpatialTemporalSearch";

export const MainLayout = (props) => {
  const settings = SettingsProvider.getSettings();

  return (
    <React.Fragment>
      <ToggleViewmode />
      <MapWrapper
        baseMapUrl={settings["OSM_URLS"]}
        enable3d
        enableTerrain
        mapViewSettings={settings["MAPVIEW_PARAMS"]}
        terrainTilesUrl={settings["TERRAIN_TILES_URL"]}
      />
      <div className="spatialsearch-container" id="spatialsearch-container">
        <SpatialTemporalSearch />
      </div>
    </React.Fragment>
  );
};
