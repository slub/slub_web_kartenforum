/**
 * Created by nicolas.looschen@pikobytes.de on 13.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilValue } from "recoil";
import { selectedFeaturesState } from "../../../../atoms/atoms.js";
import { useEffect } from "react";
import PropTypes from "prop-types";

export const LayerManagementCloser = ({ onCloseLayerManagement }) => {
  const selectedFeatures = useRecoilValue(selectedFeaturesState);

  useEffect(() => {
    if (selectedFeatures.length === 0) {
      onCloseLayerManagement();
    }
  }, [selectedFeatures]);

  return null;
};

LayerManagementCloser.propTypes = {
  onCloseLayerManagement: PropTypes.func.isRequired,
};

export default LayerManagementCloser;
