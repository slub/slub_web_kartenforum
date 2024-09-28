/**
 * Created by nicolas.looschen@pikobytes.de on 17.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { Tab, Tabs } from "react-bootstrap";

import { translate } from "../../../../../../util/util.js";
import PermalinkInput from "./components/PermalinkInput/PermalinkInput.jsx";
import { MapViewInput } from "./components/MapViewInput/MapViewInput";
import SettingsProvider from "../../../../../../SettingsProvider.js";
import "./PermalinkExporterTabs.scss";

export const getUrlWithQuery = (query) => {
  return `${window.location.origin}${window.location.pathname}?${query}`;
};

export const PermalinkExporterTabs = () => {
  const isMapViewExportForbidden = !SettingsProvider.isUserAuthenticated();

  // copy value to clipboard on button click
  return (
    <div className="vkf-permalink-exporter">
      <Tabs defaultActiveKey={1} id="permalink-exporter-tabs">
        <Tab
          eventKey={1}
          title={translate("control-permalink-title-permalink")}
        >
          <div className="permalink-exporter-content">
            <PermalinkInput />
          </div>
        </Tab>
        <Tab
          disabled={isMapViewExportForbidden}
          eventKey={2}
          title={translate("control-permalink-title-map-view")}
        >
          <div className="permalink-exporter-content">
            {!isMapViewExportForbidden && <MapViewInput />}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default React.memo(PermalinkExporterTabs);
