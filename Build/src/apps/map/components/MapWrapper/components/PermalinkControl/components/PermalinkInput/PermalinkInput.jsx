/**
 * Created by nicolas.looschen@pikobytes.de on 21.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Collection, Map } from "ol";

import {
  mapViewToUrlParams,
  serializeBasemapId,
  serializeSelectedFeatures,
  serializeViewMode,
} from "../../../../../../persistence/urlSerializer.js";
import { serializeMapView } from "../../../../../../persistence/util.js";
import { stringify } from "query-string";
import { getUrlWithQuery } from "../../PermalinkExporter.jsx";
import CopyToClipboardButton from "../CopyToClipboardButton/CopyToClipboardButton.jsx";
import { translate } from "../../../../../../../../util/util.js";

export const PermalinkInput = ({
  camera,
  map,
  isActive,
  is3dActive,
  refActiveBasemapId,
  refSelectedFeatures,
}) => {
  const [value, setValue] = useState("");

  const refInput = useRef();

  // update the shown permalink value
  const handleUpdatePermalink = useCallback(() => {
    const mapViewParams = mapViewToUrlParams(
      serializeMapView(camera, map, is3dActive),
      is3dActive
    );

    const viewModeParam = serializeViewMode(is3dActive);

    const selectedFeatureParam = serializeSelectedFeatures(
      refSelectedFeatures.current.getArray()
    );

    const basemapParam = serializeBasemapId(refActiveBasemapId.current);

    const queryString = stringify(
      Object.assign(
        {},
        mapViewParams,
        viewModeParam,
        selectedFeatureParam,
        basemapParam
      ),
      { arrayFormat: "comma" }
    );

    setValue(getUrlWithQuery(queryString));
  }, [isActive, is3dActive]);

  ////
  // Effect section
  ////

  // Handle permalink updates as long as the popover is open
  useEffect(() => {
    if (isActive) {
      handleUpdatePermalink();
    }
  }, [handleUpdatePermalink]);

  // register event handlers to handle live updates of selected features/mapView
  useEffect(() => {
    if (isActive) {
      map.on("moveend", handleUpdatePermalink);
      refSelectedFeatures.current.on("change", handleUpdatePermalink);

      return () => {
        map.un("moveend", handleUpdatePermalink);
        refSelectedFeatures.current.un("change", handleUpdatePermalink);
      };
    }
  }, [isActive, handleUpdatePermalink]);

  return (
    <>
      <div className="action-content">
        <input readOnly ref={refInput} value={value} />
        <CopyToClipboardButton value={value} />
      </div>
      <div className="description">
        <p>{translate("control-permalink-exporter-permalink-description")}</p>
      </div>
    </>
  );
};

PermalinkInput.propTypes = {
  camera: PropTypes.object,
  map: PropTypes.instanceOf(Map),
  isActive: PropTypes.bool,
  is3dActive: PropTypes.bool,
  refActiveBasemapId: PropTypes.shape({ current: PropTypes.string }),
  refSelectedFeatures: PropTypes.shape({
    current: PropTypes.instanceOf(Collection),
  }),
};

export default PermalinkInput;
