/**
 * Created by pouria.rezaei@pikobytes.de on 05.05.2023
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { getDefaultMapMetadata } from "./utils/defaultMapMetaData.js";
import UploadMapView from "./views/UploadMapView/UploadMapView.jsx";
import SearchMapView from "./views/SearchMapView/SearchMapView.jsx";
import "./App.scss";

const AppViewStates = {
  SEARCH: "search",
  UPLOAD: "upload",
};

export const App = () => {
  const [credentials, setCredentials] = useState(null);
  const [currentViewState, setCurrentViewState] = useState(
    AppViewStates.SEARCH
  );
  const [selectedMap, setSelectedMap] = useState({
    mapId: null,
    metadata: getDefaultMapMetadata(),
  });

  // Handle new selected map
  const handleSelectMap = (newSelectedMap) => {
    setSelectedMap(newSelectedMap);
    setCurrentViewState(AppViewStates.UPLOAD);
  };

  // Handle click on start upload
  const handleStartUpload = () => {
    setSelectedMap({
      mapId: null,
      metadata: getDefaultMapMetadata(),
    });
    setCurrentViewState(AppViewStates.UPLOAD);
  };
  const handleBackClick = () => {
    setCurrentViewState(AppViewStates.SEARCH);
    setSelectedMap({
      mapId: null,
      metadata: getDefaultMapMetadata(),
    });
  };

  // Handle login of user
  const handleLogin = (newCredentials) => {
    setCredentials(newCredentials);
  };

  return (
    <div className="vkf-plugin-upload-map">
      {currentViewState === AppViewStates.SEARCH && (
        <SearchMapView
          credentials={credentials}
          onLogin={handleLogin}
          onSelectMap={handleSelectMap}
          onStartUpload={handleStartUpload}
        />
      )}

      {currentViewState === AppViewStates.UPLOAD && (
        <UploadMapView
          credentials={credentials}
          mapId={selectedMap.mapId}
          mapMetadata={selectedMap.metadata}
          onBack={handleBackClick}
          onRefresh={handleSelectMap}
        />
      )}
    </div>
  );
};
export default App;
