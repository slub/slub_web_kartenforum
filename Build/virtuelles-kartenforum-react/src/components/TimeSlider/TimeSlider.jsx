/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { translate } from "../../util/util";

export const TimeSlider = (props) => {
  const { timeInterval } = props;
  const minValueElRef = useRef();
  const maxValueElRef = useRef();
  const sliderElRef = useRef();

  useEffect(() => {
    if (
      timeInterval !== undefined &&
      minValueElRef !== null &&
      maxValueElRef !== null &&
      sliderElRef !== null
    ) {
      const updatePosition = function (value, element) {
        const style_left =
          ((value - timeInterval[0]) / (timeInterval[1] - timeInterval[0])) *
          100;
        element.style.left = style_left + "%";
        element.innerHTML = value;
      };

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
          updatePosition(values[0], minValueElRef.current);
          updatePosition(values[1], maxValueElRef.current);
        },
        change: (event, ui) => {
          const values = ui["values"];
          updatePosition(values[0], minValueElRef.current);
          updatePosition(values[1], maxValueElRef.current);
          // @TODO: PROPAGATE STATE
          // this.dispatchEvent(
          //     new goog.events.Event(vk2.tool.TimeSliderEventType.TIMECHANGE, {
          //         time: values,
          //     })
          // );
        },
      });
    }
  }, [minValueElRef, maxValueElRef, sliderElRef, timeInterval]);

  return (
    <div className="timeslider-container">
      <label>{translate("timeslider-adjust-timeperiod")}</label>
      <div className="slider-container">
        <div className="slider" ref={sliderElRef}>
          <div className="tooltip-min-value" ref={minValueElRef}>
            {timeInterval[0]}
          </div>
          <div className="tooltip-max-value" ref={maxValueElRef}>
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
