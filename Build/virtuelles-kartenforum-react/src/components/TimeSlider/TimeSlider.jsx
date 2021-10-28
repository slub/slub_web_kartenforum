/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useSetRecoilState } from "recoil";
import { translate } from "../../util/util";
import { timeExtentState } from "../../atoms/atoms";

export const TimeSlider = (props) => {
  const { timeInterval } = props;

  const [isInitialized, setIsInitialized] = useState(false);
  const setTimeExtent = useSetRecoilState(timeExtentState);
  const [values, setValues] = useState(timeInterval);
  const maxValueElRef = useRef();
  const minValueElRef = useRef();
  const sliderElRef = useRef();

  const updatePosition = useCallback(
    function (value, element) {
      const style_left =
        ((value - timeInterval[0]) / (timeInterval[1] - timeInterval[0])) * 100;
      element.style.left = style_left + "%";
      element.innerHTML = value;
    },
    [timeInterval]
  );

  // update label element positions
  useEffect(() => {
    updatePosition(values[0], minValueElRef.current);
    updatePosition(values[1], maxValueElRef.current);
  }, [updatePosition, values]);

  // update slider on change of time interval
  useEffect(() => {
    if (isInitialized) {
      $(sliderElRef.current).slider("option", "min", timeInterval[0]);
      $(sliderElRef.current).slider("option", "max", timeInterval[1]);

      // trigger update of ui
      const values = $(sliderElRef.current).slider("option", "values");
      setValues(values.slice(0));
    }
  }, [isInitialized, timeInterval]);

  // initialize slider
  useEffect(() => {
    if (
      minValueElRef !== null &&
      maxValueElRef !== null &&
      sliderElRef !== null
    ) {
      $(sliderElRef.current).slider({
        range: true,
        min: timeInterval[0],
        max: timeInterval[1],
        values: [timeInterval[0], timeInterval[1]],
        animate: "slow",
        orientation: "horizontal",
        step: 1,
        slide: (event, ui) => {
          const values = ui["values"];
          setValues(values);
        },
        change: (event, ui) => {
          const values = ui["values"];
          setValues(values);
          setTimeExtent(values);
        },
      });

      setIsInitialized(true);
    }
  }, [minValueElRef, maxValueElRef, sliderElRef]);

  return (
    <div className="timeslider-container">
      <label>{translate("timeslider-adjust-timeperiod")}</label>
      <div className="slider-container">
        <div className="slider" ref={sliderElRef}>
          <div className="tooltip min-value" ref={minValueElRef}>
            {timeInterval[0]}
          </div>
          <div className="tooltip max-value" ref={maxValueElRef}>
            {timeInterval[1]}
          </div>
        </div>
      </div>
    </div>
  );
};

TimeSlider.defaultProps = {
  timeInterval: [1850, 1970],
};

TimeSlider.propTypes = {
  timeInterval: [PropTypes.number, PropTypes.number],
};

export default TimeSlider;
