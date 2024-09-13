/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "../../../../../../../util/util.js";
import SvgIcons from "../../../../../../../components/SvgIcons/SvgIcons.jsx";
import React, { useCallback } from "react";
import { triggerJsonDownload } from "../../../util.js";
import PropTypes from "prop-types";
import { GeoJSONLayer } from "../../../../MapWrapper/geojson/GeoJSONLayer.js";
import { METADATA } from "../../../../MapWrapper/geojson/constants.js";

/**
 * @typedef {Object} ExportGeojsonButtonProps React props for the ExportGeojsonButton component
 * @property {GeoJSONLayer} layer The application layer instance for geoJSON map layers
 */

/**
 *
 * @param {ExportGeojsonButtonProps} props
 * @returns
 */
export const ExportGeojsonButton = ({ layer }) => {
  const handleExportGeojson = useCallback(() => {
    triggerJsonDownload(
      layer.getMetadata(METADATA.title),
      JSON.stringify(layer.getGeoJSON())
    );
  }, [layer]);

  return (
    <button
      className="export-geojson"
      onClick={handleExportGeojson}
      type="button"
      title={translate("layermanagement-export")}
    >
      <SvgIcons name="layeraction-export" />
    </button>
  );
};

ExportGeojsonButton.propTypes = {
  layer: PropTypes.instanceOf(GeoJSONLayer).isRequired,
};

export default ExportGeojsonButton;
