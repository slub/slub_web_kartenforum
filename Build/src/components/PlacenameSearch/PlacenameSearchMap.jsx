/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilValue } from "recoil";
import { mapState } from "../../apps/map/atoms/atoms.js";
import React, { useCallback } from "react";
import PlacenameSearch from "./PlacenameSearch.jsx";
import PropTypes from "prop-types";

export const PlacenameSearchMap = ({ searchUrl }) => {
  const map = useRecoilValue(mapState);

  const handleSelectPosition = useCallback(
    (feature) => {
      if (map) {
        const lonlat = [feature["lonlat"]["x"], feature["lonlat"]["y"]];
        map.flyTo({ center: lonlat, zoom: 12 });
      }
    },
    [map]
  );

  return (
    <PlacenameSearch
      onSelectPosition={handleSelectPosition}
      searchUrl={searchUrl}
    />
  );
};

PlacenameSearchMap.propTypes = {
  searchUrl: PropTypes.string.isRequired,
};

export default PlacenameSearchMap;
