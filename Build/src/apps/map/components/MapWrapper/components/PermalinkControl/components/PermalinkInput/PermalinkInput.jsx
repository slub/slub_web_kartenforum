/**
 * Created by nicolas.looschen@pikobytes.de on 21.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  mapViewToUrlParams,
  serializeBasemapId,
  serializeSelectedFeatures,
  serializeViewMode,
} from "../../../../../../persistence/urlSerializer.js";
import { serializeMapView } from "../../../../../../persistence/util.js";
import { stringify } from "query-string";
import { getUrlWithQuery } from "../../PermalinkExporterTabs.jsx";
import CopyToClipboardButton from "../CopyToClipboardButton/CopyToClipboardButton.jsx";
import { isDefined, translate } from "../../../../../../../../util/util.js";
import { useRecoilValue } from "recoil";
import {
  activeBasemapIdState,
  mapState,
  selectedFeaturesState,
} from "../../../../../../atoms/atoms.js";

export const PermalinkInput = () => {
  const map = useRecoilValue(mapState);
  const selectedFeatures = useRecoilValue(selectedFeaturesState);
  const activeBasemapId = useRecoilValue(activeBasemapIdState);
  const [value, setValue] = useState("");

  const refInput = useRef();

  // update the shown permalink value
  const handleUpdatePermalink = useCallback(() => {
    if (!isDefined(map)) return;
    const mapViewParams = mapViewToUrlParams(serializeMapView(map, true));

    const viewModeParam = serializeViewMode(map.hasTerrain());

    const selectedFeatureParam = serializeSelectedFeatures(selectedFeatures);

    const basemapParam = serializeBasemapId(activeBasemapId);

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
  }, [map]);

  ////
  // Effect section
  ////

  // Handle permalink updates as long as the popover is open
  useEffect(() => {
    if (map) {
      handleUpdatePermalink();
      map.on("moveend", handleUpdatePermalink);
      return () => {
        map.off("moveend", handleUpdatePermalink);
      };
    }
  }, [map, handleUpdatePermalink]);

  return (
    <>
      <div className="action-content">
        <label htmlFor="permalink-value" className="visually-hidden">
          Permalink
        </label>
        <input readOnly ref={refInput} value={value} id="permalink-value" />
        <CopyToClipboardButton value={value} />
      </div>
      <div className="description">
        <p>{translate("control-permalink-exporter-permalink-description")}</p>
      </div>
    </>
  );
};

export default PermalinkInput;
