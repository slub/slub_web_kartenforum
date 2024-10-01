/**
 * Created by nicolas.looschen@pikobytes.de on 13.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilValue } from "recoil";
import { selectedLayersState } from "../../../../atoms/atoms.js";
import { useEffect } from "react";
import PropTypes from "prop-types";

export const LayerManagementCloser = ({ onCloseLayerManagement }) => {
  const selectedLayers = useRecoilValue(selectedLayersState);

  useEffect(() => {
    if (selectedLayers.length === 0) {
      onCloseLayerManagement();
    }
  }, [selectedLayers]);

  return null;
};

LayerManagementCloser.propTypes = {
  onCloseLayerManagement: PropTypes.func.isRequired,
};

export default LayerManagementCloser;
