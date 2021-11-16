/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";

import MapWrapper from "../../components/MapWrapper/MapWrapper";
import SettingsProvider from "../../SettingsProvider";
import SpatialTemporalSearch from "../../components/SpatialTemporalSearch/SpatialTemporalSearch";

export const MainLayout = () => {
  const settings = SettingsProvider.getSettings();

  return (
    <React.Fragment>
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
