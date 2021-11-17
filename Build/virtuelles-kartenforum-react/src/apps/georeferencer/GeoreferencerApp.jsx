/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { RecoilRoot } from "recoil";
import ControllerGeoreferencer from "./components/ControllerGeoreferencer/ControllerGeoreferencer";
import Toolbar from "./components/Toolbar/Toolbar";
import MapSourceView from "./views/MapSourceView/MapSourceView";
import MapTargetView from "./views/MapTargetView/MapTargetView";
import SelectTransform from "./components/SelectTransform/SelectTransform";
import SettingsProvider from "../../SettingsProvider";
import "./GeoreferencerApp.scss";

export const GeoreferencerApp = () => {
  const settings = SettingsProvider.getSettings();
  return (
    <RecoilRoot>
      <ControllerGeoreferencer />
      <div className="vk-app-georeferencer">
        <Toolbar></Toolbar>
        <div className="row content-container">
          <div className="col-sm-6 col-md-6 col-lg-6 outer-map-container">
            <MapSourceView />
          </div>
          <div className="col-sm-6 col-md-6 col-lg-6 outer-map-container">
            <MapTargetView
              urlsOsmBaseMap={settings["OSM_URLS"]}
              urlNominatim={settings["NOMINATIM_URL"]}
            />
          </div>
        </div>
      </div>
    </RecoilRoot>
  );
};

export default GeoreferencerApp;
