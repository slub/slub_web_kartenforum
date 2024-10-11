/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilState } from "recoil";
import { Range } from "rc-slider";

import { translate } from "@util/util";
import { timeExtentState } from "@map/atoms";
import "rc-slider/assets/index.css";
import "./TimeSlider.scss";

export const TimeSlider = (props) => {
  const { timeRange } = props;
  const [timeExtent, setTimeExtent] = useRecoilState(timeExtentState);
  const [values, setValues] = useState(timeRange);
  const [areLabelsToClose, setAreLabelsToClose] = useState(false);
  const maxValueElRef = useRef();
  const minValueElRef = useRef();
  const sliderElRef = useRef();

  const config = [minValueElRef, maxValueElRef];

  const updatePositions = useCallback(
    function () {
      let lastPercentage = undefined;

      config.forEach((ref, index) => {
        const element = ref.current;
        const value = values[index];
        const style_left =
          ((value - timeRange[0]) / (timeRange[1] - timeRange[0])) * 100;

        element.style.left = style_left + "%";
        element.innerHTML = value;

        if (
          lastPercentage !== undefined &&
          Math.abs(style_left - lastPercentage) < 12
        ) {
          setAreLabelsToClose(true);
        } else {
          setAreLabelsToClose(false);
        }

        lastPercentage = style_left;
      });
    },
    [values, timeRange]
  );

  // update label element positions
  useEffect(() => {
    updatePositions();
  }, [updatePositions, values]);

  // synchronize external state with internal state
  useEffect(() => {
    if (timeExtent[0] !== values[0] || timeExtent[1] !== values[1]) {
      setValues(timeExtent);
    }
  }, [timeExtent]);

  return (
    <div className="timeslider-container">
      <label>{translate("timeslider-adjust-timeperiod")}</label>
      <div
        className={`slider-container ${
          areLabelsToClose ? "labels-too-close" : ""
        }`}
      >
        <Range
          allowCross={false}
          ariaLabelledByGroupForHandles={["min-value", "max-value"]}
          min={timeRange[0]}
          max={timeRange[1]}
          onChange={(values) => {
            setValues(values);
          }}
          onAfterChange={(values) => {
            setValues(values);
            setTimeExtent(values);
          }}
          ref={sliderElRef}
          value={values}
        />
        <div className="tooltip min-value" id="min-value" ref={minValueElRef}>
          {values[0]}
        </div>
        <div className="tooltip max-value" id="max-value" ref={maxValueElRef}>
          {values[1]}
        </div>
      </div>
    </div>
  );
};

TimeSlider.defaultProps = {
  timeRange: [1850, 1970],
};

TimeSlider.propTypes = {
  timeRange: PropTypes.arrayOf(PropTypes.number),
};

export default TimeSlider;
