/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilValue } from "recoil";
import { timeRangeState } from "../../atoms/atoms";
import PlacenameSearch from "../PlacenameSearch/PlacenameSearch";
import MapSearch from "../MapSearch/MapSearch";
import TimeSlider from "../TimeSlider/TimeSlider";
import { SettingsProvider } from "../../index";
import "./SpatialTemporalSearch.scss";

export const SpatialTemporalSearch = () => {
  const timeRange = useRecoilValue(timeRangeState);

  return (
    <div className="spatialsearch-inner-container">
      <div className="spatialsearch-content-panel">
        <div className="body-container">
          <PlacenameSearch
            projection={SettingsProvider.getDefaultMapView().projection}
            searchUrl={SettingsProvider.getNominatimUrl()}
          />
          <TimeSlider timeRange={timeRange} />
          <MapSearch />
        </div>
      </div>
    </div>
  );
};

export default SpatialTemporalSearch;
