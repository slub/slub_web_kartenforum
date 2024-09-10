/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import { timeRangeState } from "../../atoms/atoms";
import MapSearch from "../MapSearch/MapSearch";
import TimeSlider from "../TimeSlider/TimeSlider";
import SettingsProvider from "../../../../SettingsProvider";
import PlacenameSearchMap from "../../../../components/PlacenameSearch/PlacenameSearchMap.jsx";
import "./SpatialTemporalSearch.scss";

export const SpatialTemporalSearch = ({
  customQuery,
  MapSearchListItemComponent,
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
          />
        </div>
      </div>
    </div>
  );
};

SpatialTemporalSearch.propTypes = {
  customQuery: PropTypes.array,
  MapSearchListItemComponent: PropTypes.elementType,
};

export default SpatialTemporalSearch;
