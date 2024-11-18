/*
 * Created by tom.schulze@pikobytes.de on 24.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { translate } from "@util/util";
import { timeRangeState, timeExtentState } from "@map/atoms";
import TimeSlider from "@components/TimeSlider";

const TimeSliderSearch = () => {
  const timeRange = useRecoilValue(timeRangeState);
  const [timeExtent, setTimeExtent] = useRecoilState(timeExtentState);

  const handleChange = useCallback((values) => setTimeExtent(values), []);

  return (
    <TimeSlider
      title={translate("timeslider-adjust-timeperiod")}
      timeRange={timeRange}
      onChange={handleChange}
      values={timeExtent}
      sliderProps={{ draggableTrack: true }}
    />
  );
};

TimeSliderSearch.propTypes = {};

export default TimeSliderSearch;
