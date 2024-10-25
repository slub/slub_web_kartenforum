/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "@util/util.js";
import SvgIcons from "@components/SvgIcons";
import React, { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { selectedOriginalMapIdState } from "@map/atoms";
import PropTypes from "prop-types";

export const ShowOriginalButton = ({ layer }) => {
  const setSelectedOriginalMapId = useSetRecoilState(
    selectedOriginalMapIdState
  );

  // Open original map
  const handleOriginalMap = useCallback(() => {
    setSelectedOriginalMapId(layer.getId());
  }, [layer]);

  return (
    <button
      className="show-original"
      onClick={handleOriginalMap}
      type="button"
      title={translate("layermanagement-show-original")}
    >
      <SvgIcons name="layeraction-showoriginal" />
    </button>
  );
};

ShowOriginalButton.propTypes = {
  layer: PropTypes.object,
};

export default ShowOriginalButton;
