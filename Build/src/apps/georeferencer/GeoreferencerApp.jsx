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
import Notifications from "@components/Notifications";
import SettingsProvider from "@settings-provider";
import "./GeoreferencerApp.scss";

export const GeoreferencerApp = () => {
  return (
    <RecoilRoot>
      <div className="vk-app-georeferencer">
        <div>
          <Toolbar />
          <GeoreferenceView
            urlsOsmBaseMap={SettingsProvider.getDefaultBaseMapUrls()}
            urlNominatim={SettingsProvider.getNominatimUrl()}
          />
          <Notifications />
        </div>
      </div>
    </RecoilRoot>
  );
};

export default GeoreferencerApp;
