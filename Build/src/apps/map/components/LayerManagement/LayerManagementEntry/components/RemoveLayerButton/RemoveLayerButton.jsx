/**
 * Created by nicolas.looschen@pikobytes.de on 03.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { isDefined, translate } from "@util/util.js";
import SvgIcons from "@components/SvgIcons";
import React from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import PropTypes from "prop-types";
import {
  mapState,
  selectedLayersState,
  selectedGeoJsonFeatureIdentifierState,
} from "@map/atoms";
import { LAYER_TYPES } from "@map/components/CustomLayers";

export const RemoveLayerButton = (props) => {
  const { layer } = props;
  const map = useRecoilValue(mapState);
  const setSelectedLayers = useSetRecoilState(selectedLayersState);
  const [
    selectedGeoJsonFeatureIdentifier,
    setSelectedGeoJsonFeatureIdentifier,
  ] = useRecoilState(selectedGeoJsonFeatureIdentifierState);

  // Remove layer from layer stack
  const handleRemoveLayer = (event) => {
    event.stopPropagation();
    if (isDefined(map)) {
      layer.removeMapLibreLayers(map);

      setSelectedLayers((oldSelectedLayers) =>
        oldSelectedLayers.filter(
          (oldLayer) => oldLayer.getId() !== layer.getId()
        )
      );

      if (
        layer.getType() === LAYER_TYPES.GEOJSON &&
        selectedGeoJsonFeatureIdentifier.sourceId === layer.getId()
      ) {
        // close geojson feature panel
        setSelectedGeoJsonFeatureIdentifier({
          featureId: undefined,
          sourceId: undefined,
        });
      }
    }
  };

  return (
    <button
      className="remove-layer minimize-tool"
      onClick={handleRemoveLayer}
      type="button"
      title={translate("layermanagement-remove-map")}
    >
      <SvgIcons name="layeraction-remove-map" />
    </button>
  );
};

RemoveLayerButton.propTypes = {
  layer: PropTypes.object.isRequired,
};

export default RemoveLayerButton;
