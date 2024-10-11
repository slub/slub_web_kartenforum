/**
 * Created by nicolas.looschen@pikobytes.de on 03.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { isDefined, translate } from "@util/util.js";
import SvgIcons from "@components/SvgIcons";
import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import PropTypes from "prop-types";
import { mapState, selectedLayersState } from "@map/atoms";

export const RemoveLayerButton = (props) => {
  const { layer } = props;
  const map = useRecoilValue(mapState);
  const setSelectedLayers = useSetRecoilState(selectedLayersState);

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
