/**
 * Created by nicolas.looschen@pikobytes.de on 28.06.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { RecoilRoot } from "recoil";

import MapWrapper from "../map/components/MapWrapper/MapWrapper.jsx";
import SettingsProvider from "../../SettingsProvider.js";
import { LAYOUT_TYPES } from "../map/layouts/util.js";
import MosaiMapLayout from "./layouts/MosaicMapLayout.jsx";
import MosaicMapSelectorDropdown from "./components/MosaicMapSelectorDropdown/MosaicMapSelectorDropdown.jsx";
import RefreshOverviewButton from "./components/ToolbarControls/RefreshOverviewButton.jsx";
import SaveMosaicMapButton from "./components/ToolbarControls/SaveMosaicMapButton/SaveMosaicMapButton.jsx";
import DeleteMosaicMapButton from "./components/ToolbarControls/DeleteMosaicMapButton/DeleteMosaicMapButton.jsx";
import MosaicMapInputPanel from "./components/MosaicMapInputPanel/MosaicMapInputPanel.jsx";
import Notifications from "../../components/Notifications/Notifications.jsx";

import "./AppMosaicMap.scss";

export const AppMosaicMap = () => {
  return (
    <RecoilRoot>
      <div className="vkf-app-mosaic-map-container">
        <Notifications />
        <div className="vkf-mosaic-map-toolbar">
          <div>
            <MosaicMapSelectorDropdown />
          </div>
          <div>
            <RefreshOverviewButton />
            <SaveMosaicMapButton />
            <DeleteMosaicMapButton />
          </div>
        </div>
        <div className="vk-mosaic-map-input-panel">
          <MosaicMapInputPanel />
        </div>
        <div className="vkf-plugin-map-mosaic" id="map-container">
          <MapWrapper
            {...{
              disableClickHandler: true, // TODO GEOJSON PORT - can safely be removed as geojson feature click handler is ported to a hook
              baseMapUrl: SettingsProvider.getDefaultBaseMapUrls(),
              enable3d: false,
              enableTerrain: false,
              layout: LAYOUT_TYPES.HORIZONTAL,
              mapViewSettings: SettingsProvider.getDefaultMapView(),
              terrainTilesService: SettingsProvider.getTerrainService(),
              ChildComponent: MosaiMapLayout,
            }}
          />
        </div>
      </div>
    </RecoilRoot>
  );
};

AppMosaicMap.propTypes = {};

export default AppMosaicMap;
