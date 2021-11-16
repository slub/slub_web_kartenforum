/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";

import { SettingsProvider } from "../../SettingsProvider";
import GazetteerSearch from "../GazetteerSearch/GazetteerSearch";
import MapSearch from "../MapSearch/MapSearch";
import TimeSlider from "../TimeSlider/TimeSlider";
import { timeRangeState } from "../../atoms/atoms";
import { createStatisticQuery } from "../../util/query";
import "./SpatialTemporalSearch.scss";

export const SpatialTemporalSearch = () => {
  const settings = SettingsProvider.getSettings();

  // state
  const [timeRange, setTimeRange] = useRecoilState(timeRangeState);

  const loadInitialSettings = () => {
    const requestUrl = `${settings.ELASTICSEARCH_NODE}/_search?`;
    const payload = createStatisticQuery("time");
    axios.post(requestUrl, JSON.stringify(payload)).then((resp) => {
      if (resp.status === 200) {
        const data = resp.data;
        const max = new Date(data["aggregations"]["summary"]["max"]),
          min = new Date(data["aggregations"]["summary"]["min"]);
        setTimeRange([min.getUTCFullYear(), max.getUTCFullYear()]);
      }
    });
  };

  useEffect(() => {
    loadInitialSettings();
  }, []);

  return (
    <div className="spatialsearch-inner-container">
      <div className="spatialsearch-content-panel">
        <div className="body-container">
          <GazetteerSearch
            projection={settings.MAPVIEW_PARAMS["projection"]}
            searchUrl={settings.NOMINATIM_URL}
          />
          <TimeSlider timeRange={timeRange} />
          <MapSearch />
        </div>
      </div>
    </div>
  );
};

export default SpatialTemporalSearch;
