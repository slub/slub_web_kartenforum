/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "../../../../../../../util/util.js";
import SvgIcons from "../../../../../../../components/SvgIcons/SvgIcons.jsx";
import React, { useCallback } from "react";
import { serializeOperationalLayer } from "../../../../../persistence/util.js";
import { triggerJsonDownload } from "../../../util.js";
import { useRecoilValue } from "recoil";
import { selectedFeaturesState } from "../../../../../atoms/atoms.js";
import PropTypes from "prop-types";

export const ExportGeojsonButton = ({ layer }) => {
  const selectedFeatures = useRecoilValue(selectedFeaturesState);

  // triggers the download of a geojson file name like the clicked layer
  const handleExportGeojson = useCallback(() => {
    const layerId = layer.metadata?.["vkf:id"];
    const selectedFeature = selectedFeatures.find(
      (selFeature) => selFeature.feature.getId() === layerId
    );
    const serializedLayer = serializeOperationalLayer(selectedFeature, layer);

    triggerJsonDownload(
      serializedLayer.properties.title,
      JSON.stringify(serializedLayer.geojson)
    );
  }, [layer, selectedFeatures]);

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
  layer: PropTypes.object,
};

export default ExportGeojsonButton;
