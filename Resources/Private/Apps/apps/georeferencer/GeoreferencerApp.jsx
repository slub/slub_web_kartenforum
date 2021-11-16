/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { RecoilRoot } from "recoil";
import Toolbar from "./components/Toolbar/Toolbar";
import GeoreferenceView from "./views/GeoreferenceView/GeoreferenceView";
import Notifications from "../../components/Notifications/Notifications";
import SettingsProvider from "../../SettingsProvider";
import "./GeoreferencerApp.scss";

export const GeoreferencerApp = () => {
  const settings = SettingsProvider.getSettings();
  return (
    <RecoilRoot>
      <ControllerGeoreferencer />
      <div className="vk-app-georeferencer">
        <Toolbar />
        <GeoreferenceView
          urlsOsmBaseMap={settings["OSM_URLS"]}
          urlNominatim={settings["NOMINATIM_URL"]}
        />
        <Notifications />
      </div>
    </RecoilRoot>
  );
};

export default GeoreferencerApp;
