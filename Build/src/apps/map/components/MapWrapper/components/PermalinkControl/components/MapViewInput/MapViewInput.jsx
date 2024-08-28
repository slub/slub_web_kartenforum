/**
 * Created by nicolas.looschen@pikobytes.de on 21.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useState } from "react";
import { Glyphicon } from "react-bootstrap";
import clsx from "clsx";
import PropTypes from "prop-types";

import CopyToClipboardButton from "../CopyToClipboardButton/CopyToClipboardButton.jsx";
import { getUrlWithQuery } from "../../PermalinkExporter.jsx";
import SettingsProvider from "../../../../../../../../SettingsProvider.js";
import { translate } from "../../../../../../../../util/util.js";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner/LoadingSpinner.jsx";
import { useLocalStorage } from "../../../../../../persistence/util.js";
import { PERSISTENCE_CUSTOM_BASEMAP_KEYS } from "../../../../../BasemapSelector/BasemapSelector.jsx";
import "./MapViewInput.scss";

export const MapViewInput = ({ refApplicationStateUpdater }) => {
  const [customLayers] = useLocalStorage(PERSISTENCE_CUSTOM_BASEMAP_KEYS, []);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");

  const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();
  const persistPath = "/map_view/";

  const handleUploadMapView = useCallback(() => {
    if (refApplicationStateUpdater.current !== undefined) {
      const { searchOptions, ...mapView } =
        refApplicationStateUpdater.current();

      const customBasemaps = customLayers.filter(
        (layer) => layer.id === mapView.activeBasemapId
      );

      // add in custom basemaps if one is selected
      const uploadMapView = Object.assign(
        {},
        mapView,
        customBasemaps.length > 0 ? { customBasemaps } : null
      );

      setIsLoading(true);
      return georeferenceApi
        .post(persistPath, { map_view_json: uploadMapView })
        .then((res) => {
          if (res.status === 200 && res.data !== undefined) {
            const { map_view_id } = res.data;
            const mapViewUrl = getUrlWithQuery(`map_view_id=${map_view_id}`);
            setValue(mapViewUrl);
            setIsLoading(false);

            return mapViewUrl;
          }
        });
    }
  }, [customLayers, refApplicationStateUpdater.current]);

  return (
    <>
      <div className="action-content">
        <label htmlFor="permalink-mapview" className="visually-hidden">
          Permalink
        </label>
        <input
          placeholder={translate("control-permalink-input-mapview-placeholder")}
          readOnly
          value={value}
          id="permalink-mapview"
        />

        <CopyToClipboardButton onClick={handleUploadMapView} value={value} />
        <button
          className={clsx("upload-button", isLoading && "loading")}
          onClick={handleUploadMapView}
        >
          {isLoading ? <LoadingSpinner /> : <Glyphicon glyph="upload" />}
          Upload
        </button>
      </div>
      <div className="description">
        <p>{translate("control-permalink-exporter-mapview-description")}</p>
      </div>
    </>
  );
};

MapViewInput.propTypes = {
  refApplicationStateUpdater: PropTypes.shape({ current: PropTypes.func }),
};
