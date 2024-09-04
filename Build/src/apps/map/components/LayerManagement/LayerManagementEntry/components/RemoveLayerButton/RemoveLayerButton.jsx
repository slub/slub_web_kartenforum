/**
 * Created by nicolas.looschen@pikobytes.de on 03.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "../../../../../../../util/util.js";
import SvgIcons from "../../../../../../../components/SvgIcons/SvgIcons.jsx";
import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import PropTypes from "prop-types";
import { mapState, selectedFeaturesState } from "../../../../../atoms/atoms.js";
import { removeLayer } from "../../../util.js";

export const RemoveLayerButton = (props) => {
  const { layer } = props;
  const map = useRecoilValue(mapState);
  const setSelectedFeatures = useSetRecoilState(selectedFeaturesState);

  // Remove layer from layer stack
  const handleRemoveLayer = (event) => {
    removeLayer(map, layer.id);
    event.stopPropagation();

    setSelectedFeatures((oldSelectedFeatures) =>
      oldSelectedFeatures.filter(
        ({ feature }) => feature.getId() !== layer.metadata["vkf:id"]
      )
    );
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