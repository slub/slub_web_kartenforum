/**
 * Created by pouria.rezaei@pikobytes.de on 05.05.2023
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";
import { translate } from "../../../../util/util.js";
import { readMapForMapId } from "../../utils/apiUpload.js";
import SearchInputField from "../../components/SearchInputField/SearchInputField.jsx";
import MapEntry from "../../components/MapEntry/MapEntry.jsx";
import UserLogin from "../../components/UserLogin/UserLogin.jsx";
import "./SearchMapView.scss";

export default function SearchMapView(props) {
  const { credentials, onLogin, onSelectMap, onStartUpload } = props;
  const [selectedMap, setSelectMap] = useState({
    mapId: null,
    metadata: null,
  });
  const [showError, setShowError] = useState(false);
  const disableActions = useMemo(() => credentials === null, [credentials]);

  // Handle submit of map id
  const handleEnterId = useMemo(
    () =>
      debounce(async (mapId) => {
        if (credentials === null) {
          console.warn("No credentials provided");
          return;
        }

        const newMapMetadata = await readMapForMapId(
          mapId,
          credentials.username,
          credentials.password
        );

        if (newMapMetadata !== null) {
          setSelectMap({
            mapId: mapId,
            metadata: newMapMetadata,
          });
          setShowError(false);
        } else {
          setSelectMap({
            mapId: null,
            metadata: null,
          });
          setShowError(true);
        }
      }, 300),
    [credentials]
  );

  return (
    <div className="container search-view">
      <div className="content-login">
        <UserLogin onLogin={onLogin} />
      </div>
      <hr role="separator" className="divider"></hr>
      <div className={`content-header ${disableActions ? "disabled" : ""}`}>
        <h4>{translate("searchmap-title")}</h4>
        <button
          type="button"
          disabled={disableActions}
          className={`btn btn-primary upload-button ${
            disableActions ? "disabled" : ""
          }`}
          onClick={() => onStartUpload()}
        >
          {translate("searchmap-upload-button")}
        </button>
      </div>
      <div className={`content-body ${disableActions ? "disabled" : ""}`}>
        <SearchInputField onEnterId={handleEnterId} />
        {selectedMap.mapId !== null && (
          <ul className="map-list">
            <MapEntry
              mapId={selectedMap.mapId}
              mapMetadata={selectedMap.metadata}
              onClick={() => onSelectMap(selectedMap)}
            />
          </ul>
        )}

        {showError && (
          <div className="not-found body1">
            <p>{translate("uploadmap-p")}</p>
            <ul className="no-results">
              <li>{translate("uploadmap-li1")}</li>
              <li>{translate("uploadmap-li2")}</li>
              <li>{translate("uploadmap-li3")}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

SearchMapView.propTypes = {
  credentials: PropTypes.shape({
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }),
  onLogin: PropTypes.func.isRequired,
  onSelectMap: PropTypes.func.isRequired,
  onStartUpload: PropTypes.func.isRequired,
};
