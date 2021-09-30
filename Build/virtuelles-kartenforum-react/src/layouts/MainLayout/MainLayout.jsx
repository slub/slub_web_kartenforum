/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { MapWrapper } from "../../components/MapWrapper/MapWrapper";
import Sidebar from "../../components/Sidebar/Sidebar";
import { SettingsProvider } from "../../index";
import ToggleViewmode from "../../components/ToggleViewmode/ToggleViewmode";

export const MainLayout = (props) => {
  const settings = SettingsProvider.getSettings();

  return (
    <React.Fragment>
      <ToggleViewmode />
      {/*<Sidebar />*/}
      <MapWrapper
        mapViewSetings={settings["MAPVIEW_PARAMS"]}
        enable3d
        enableTerrain
        terrainTilesUrl={settings["TERRAIN_TILES_URL"]}
      />
    </React.Fragment>
  );
};
