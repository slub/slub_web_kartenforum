/**
 * Created by nicolas.looschen@pikobytes.de on 17.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import PropTypes from "prop-types";
import { Collection, Map } from "ol";

import { translate } from "../../../../../../util/util.js";
import PermalinkInput from "./components/PermalinkInput/PermalinkInput.jsx";
import { MapViewInput } from "./components/MapViewInput/MapViewInput";
import SettingsProvider from "../../../../../../SettingsProvider.js";
import "./PermalinkExporter.scss";

export const getUrlWithQuery = (query) => {
  return `${window.location.origin}${window.location.pathname}?${query}`;
};

export const PermalinkExporter = ({ refApplicationStateUpdater, ...props }) => {
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
            <PermalinkInput {...props} />
          </div>
        </Tab>
        <Tab
          disabled={isMapViewExportForbidden}
          eventKey={2}
          title={translate("control-permalink-title-map-view")}
        >
          <div className="permalink-exporter-content">
            <MapViewInput
              refApplicationStateUpdater={refApplicationStateUpdater}
            />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

PermalinkExporter.propTypes = {
  camera: PropTypes.object,
  map: PropTypes.instanceOf(Map),
  isActive: PropTypes.bool,
  is3dActive: PropTypes.bool,
  refActiveBasemapId: PropTypes.shape({ current: PropTypes.string }),
  refApplicationStateUpdater: PropTypes.shape({
    current: PropTypes.func,
  }),
  refSelectedFeatures: PropTypes.shape({
    current: PropTypes.instanceOf(Collection),
  }),
};

export default React.memo(PermalinkExporter);
