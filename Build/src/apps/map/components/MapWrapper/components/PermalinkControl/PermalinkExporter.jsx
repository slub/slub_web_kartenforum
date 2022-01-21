/**
 * Created by nicolas.looschen@pikobytes.de on 17.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { stringify } from "query-string";
import { Glyphicon, Overlay, Tooltip } from "react-bootstrap";
import PropTypes from "prop-types";
import { Collection, Map } from "ol";

import { serializeMapView } from "../../../../persistence/util";
import {
  mapViewToUrlParams,
  serializeBasemapId,
  serializeSelectedFeatures,
  serializeViewMode,
} from "../../../../persistence/urlSerializer";
import { translate } from "../../../../../../util/util.js";

import "./PermalinkExporter.scss";

const getUrlWithQuery = (query) => {
  return `${window.location.origin}${window.location.pathname}?${query}`;
};

export const PermalinkExporter = ({
  camera,
  map,
  isActive,
  is3dActive,
  refActiveBasemapId,
  refSelectedFeatures,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [value, setValue] = useState("");

  const refButton = useRef();
  const refInput = useRef();
  const refTimeout = useRef();

  ////
  // Handler section
  ////

  // copy value to clipboard on button click
  const handleCopyToClipboard = () => {
    clearTimeout(refTimeout.current);
    navigator.clipboard.writeText(value);
    setIsTooltipOpen(true);
  };

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

  // close tooltip after 1 second
  useEffect(() => {
    if (isTooltipOpen) {
      refTimeout.current = setTimeout(() => {
        setIsTooltipOpen(false);
      }, 1000);
    }

    return () => {
      clearTimeout(refTimeout.current);
    };
  }, [isTooltipOpen]);

  return (
    <div className="vkf-permalink-exporter">
      <div className="permalink-exporter-title">
        <h4>{translate("control-permalink-exporter-title")}</h4>
      </div>
      <div className="permalink-exporter-content">
        <input readOnly ref={refInput} value={value} />
        <button
          className="copy-button"
          onClick={handleCopyToClipboard}
          ref={refButton}
          title={translate("control-permalink-exporter-copy-title")}
        >
          <Glyphicon glyph="copy" />
        </button>
      </div>
      <Overlay
        placement="right"
        target={refButton.current}
        show={isTooltipOpen}
      >
        <Tooltip id="copy-state-indicator">
          {translate("control-permalink-exporter-copy")}
        </Tooltip>
      </Overlay>
    </div>
  );
};

PermalinkExporter.propTypes = {
  camera: PropTypes.object,
  map: PropTypes.instanceOf(Map),
  isActive: PropTypes.bool,
  is3dActive: PropTypes.bool,
  refActiveBasemapId: PropTypes.shape({ current: PropTypes.string }),
  refSelectedFeatures: PropTypes.shape({
    current: PropTypes.instanceOf(Collection),
  }),
};

export default React.memo(PermalinkExporter);
