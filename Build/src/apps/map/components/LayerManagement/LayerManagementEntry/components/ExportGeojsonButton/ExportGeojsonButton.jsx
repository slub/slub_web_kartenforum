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
import GeoJsonLayer from "../../../../CustomLayers/GeoJsonLayer/GeoJsonLayer.js";
import { METADATA } from "../../../../CustomLayers/GeoJsonLayer/constants.js";

/**
 * @typedef {Object} ExportGeojsonButtonProps React props for the ExportGeojsonButton component
 * @property {GeoJsonLayer} layer The application layer instance for geoJSON map layers
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
  layer: PropTypes.instanceOf(GeoJsonLayer).isRequired,
};

export default ExportGeojsonButton;
