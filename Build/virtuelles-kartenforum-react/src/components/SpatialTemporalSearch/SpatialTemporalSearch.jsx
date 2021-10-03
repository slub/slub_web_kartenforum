/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { SettingsProvider } from "../../index";
import GazetteerSearch from "../GazetteerSearch/GazetteerSearch";
import MapSearch from "../MapSearch/MapSearch";

export const SpatialTemporalSearch = (props) => {
  const settings = SettingsProvider.getSettings();

  return (
    <div className="spatialsearch-inner-container">
      <div className="spatialsearch-content-panel">
        <div className="body-container">
          <GazetteerSearch searchUrl={settings.NOMINATIM_URL} />
          <MapSearch />
        </div>
      </div>
    </div>
  );
};

export default SpatialTemporalSearch;
