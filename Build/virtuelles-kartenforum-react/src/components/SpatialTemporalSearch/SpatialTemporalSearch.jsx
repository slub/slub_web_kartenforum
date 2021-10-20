/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { SettingsProvider } from "../../index";
import GazetteerSearch from "../GazetteerSearch/GazetteerSearch";
import MapSearch from "../MapSearch/MapSearch";
import TimeSlider from "../TimeSlider/TimeSlider";

export const SpatialTemporalSearch = (props) => {
  const [timeInterval, setTimeInterval] = useState([1850, 1970]);
  const settings = SettingsProvider.getSettings();

  return (
    <div className="spatialsearch-inner-container">
      <div className="spatialsearch-content-panel">
        <div className="body-container">
          <GazetteerSearch searchUrl={settings.NOMINATIM_URL} />
          <TimeSlider timeInterval={timeInterval} />
          <MapSearch />
        </div>
      </div>
    </div>
  );
};

export default SpatialTemporalSearch;

const loadTimeSlider = function (parentEl) {
  // build elasticsearch request
  var requestPayload = vk2.request.ElasticSearch.createStatisticQuery("time"),
    requestUrl = vk2.settings.ELASTICSEARCH_NODE + "/_search",
    timeSlider = new vk2.tool.TimeSlider(parentEl);

  goog.net.XhrIo.send(
    requestUrl,
    function (e) {
      var xhr = /** @type {goog.net.XhrIo} */ (e.target),
        timeInterval;

      if (xhr.getResponseJson()) {
        var data = xhr.getResponseJson(),
          max = new Date(data["aggregations"]["summary"]["max"]),
          min = new Date(data["aggregations"]["summary"]["min"]);
        timeInterval = [min.getUTCFullYear(), max.getUTCFullYear()];
      } else {
        timeInterval = [1850, 1970];
      }

      timeSlider.setTimeInterval(timeInterval);
    },
    "POST",
    JSON.stringify(requestPayload)
  );

  return timeSlider;
};

const loadMapSearchModule = function (parentEl, map, timeSlider) {
  /**
   * @type {vk2.module.MapSearchModule}
   * @private
   */
  this.mapsearch_ = new vk2.module.MapSearchModule(parentEl, map);

  // bind mapsearch to timeslider tool
  goog.events.listen(
    timeSlider,
    vk2.tool.TimeSliderEventType.TIMECHANGE,
    function (event) {
      this.mapsearch_
        .getFeatureSource()
        .setTimeFilter(event["target"]["time"][0], event["target"]["time"][1]);
      this.mapsearch_.getFeatureSource().refresh();
    },
    undefined,
    this
  );
};
