/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { isDefined, translate } from "@util/util.js";
import SvgIcons from "@components/SvgIcons/SvgIcons.jsx";
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { GeoJsonLayer } from "@map/components/CustomLayers";
import { selectedGeoJsonLayerIdState } from "@map/atoms";
import { useSetRecoilState } from "recoil";

/**
 * @typedef {Object} ShowGeoJsonLayerButton React props for the ExportGeojsonButton component
 * @property {GeoJsonLayer} layer The application layer instance for geoJSON map layers
 */

/**
 *
 * @param {ShowGeoJsonLayerButton} props
 * @returns
 */
export const ShowGeoJsonLayerButton = ({ layer }) => {
  const setSelectedGeoJsonLayerId = useSetRecoilState(
    selectedGeoJsonLayerIdState
  );

  const handleSelectGeoJsonlayer = useCallback(() => {
    if (layer && isDefined(layer.getId())) {
      setSelectedGeoJsonLayerId(layer.getId());
    }
  }, [layer]);

  return (
    <button
      className="show-geojson-layer"
      onClick={handleSelectGeoJsonlayer}
      type="button"
      title={translate("layermanagement-show-geojson")}
    >
      <SvgIcons name="layermanagement-show-geojson" />
    </button>
  );
};

ShowGeoJsonLayerButton.propTypes = {
  layer: PropTypes.instanceOf(GeoJsonLayer).isRequired,
};

export default ShowGeoJsonLayerButton;
