/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import { timeRangeState } from "@map/atoms";
import MapSearch from "@map/components/MapSearch/MapSearch";
import TimeSlider from "@map/components/TimeSlider/TimeSlider";
import SettingsProvider from "@settings-provider";
import PlacenameSearchMap from "@components/PlacenameSearch/PlacenameSearchMap.jsx";
import "./SpatialTemporalSearch.scss";

export const SpatialTemporalSearch = ({
  customQuery,
  MapSearchListItemComponent,
  mosaicMode,
}) => {
  const timeRange = useRecoilValue(timeRangeState);

  return (
    <div className="spatialsearch-inner-container">
      <div className="spatialsearch-content-panel">
        <div className="body-container">
          <PlacenameSearchMap searchUrl={SettingsProvider.getNominatimUrl()} />
          <TimeSlider timeRange={timeRange} />
          <MapSearch
            customQuery={customQuery}
            MapSearchListItemComponent={MapSearchListItemComponent}
            mosaicMode={mosaicMode}
          />
        </div>
      </div>
    </div>
  );
};

SpatialTemporalSearch.propTypes = {
  customQuery: PropTypes.array,
  MapSearchListItemComponent: PropTypes.elementType,
  mosaicMode: PropTypes.bool,
};

export default SpatialTemporalSearch;
