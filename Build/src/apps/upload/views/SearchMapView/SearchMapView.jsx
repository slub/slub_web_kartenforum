/**
 * Created by pouria.rezaei@pikobytes.de on 05.05.2023
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";
import { translate } from "@util/util.js";
import { readMapForMapId } from "@upload/utils/apiUpload.js";
import SearchInputField from "@upload/components/SearchInputField/SearchInputField.jsx";
import MapEntry from "@upload/components/MapEntry/MapEntry.jsx";
import "./SearchMapView.scss";

export default function SearchMapView(props) {
  const { onSelectMap, onStartUpload } = props;
  const [selectedMap, setSelectMap] = useState({
    mapId: null,
    metadata: null,
  });
  const [httpErrorStatusCode, setHttpErrorStatusCode] = useState(null);

  // Handle submit of map id
  const handleEnterId = debounce(async (mapId) => {
    const response = await readMapForMapId(mapId);
    const newMapMetadata = response.data;

    if (newMapMetadata !== null) {
      setSelectMap({
        mapId: mapId,
        metadata: newMapMetadata,
      });
      setHttpErrorStatusCode(null);
    } else {
      setSelectMap({
        mapId: null,
        metadata: null,
      });
      setHttpErrorStatusCode(response.httpErrorStatusCode);
    }
  }, 300);

  return (
    <div className="container search-view">
      <div className="content-header">
        <h3>{translate("searchmap-title")}</h3>
        <button
          type="button"
          className="btn btn-primary upload-button"
          onClick={() => onStartUpload()}
        >
          {translate("searchmap-upload-button")}
        </button>
      </div>
      <div className="content-body">
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

        {httpErrorStatusCode !== null && (
          <div className="not-found body1">
            <p>{translate("uploadmap-p")}</p>
            <ul className="no-results">
              {httpErrorStatusCode === 400 && (
                <li>{translate("searchmap-errors-http-400")}</li>
              )}
              {httpErrorStatusCode === 401 && (
                <li>{translate("common-errors-http-401")}</li>
              )}
              {httpErrorStatusCode === 403 && (
                <li>{translate("common-errors-http-403")}</li>
              )}
              {httpErrorStatusCode === 404 && (
                <>
                  <li>{translate("uploadmap-li1")}</li>
                  <li>{translate("uploadmap-li2")}</li>
                  <li>{translate("uploadmap-li3")}</li>
                </>
              )}
              {httpErrorStatusCode > 404 && (
                <li>{translate("common-errors-unexpected")}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

SearchMapView.propTypes = {
  onSelectMap: PropTypes.func.isRequired,
  onStartUpload: PropTypes.func.isRequired,
};
