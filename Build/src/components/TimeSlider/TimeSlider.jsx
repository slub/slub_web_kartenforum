/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Range } from "rc-slider";

import TimeSliderControls from "./TimeSliderControls/TimeSliderControls";
import Label from "./Label/Label";
import {
  calculateCollisionLabelPosition,
  calculateLabelPositions,
} from "./util";

import "rc-slider/assets/index.css";
import "./TimeSlider.scss";

// Quick workaround to prevent DOM changes for hidden slider labels. Beware: affects labelWidth which affects positions.
const STATIC_DUMMY = [1000, 1000];

/**
 * TimeSlider properties
 * @typedef {Object} TimeSlider properties
 * @property {string} title - The title string appearing above the slider itself
 * @property {[number, number]} values - The initial selected extent of the time slider in unix seconds or years
 * @property {[number, number]} timeRange - The min and max values in unix seconds or years
 * @property {(values: [number, number]) => void} onChange - The selected value emitter
 * @property {object} sliderProps - Properties passed down to the rc-slider component
 * @property {boolean} shouldUseDate - If true, slider expects unix seconds for values and timeRange, else years
 * @property {boolean} showControls - Whether or not to show the input fields. Only works with shouldUseDate = true.
 */

/**
 * A time slider component based on the rc-slider library.
 * @param {TimeSlider} props
 */
export const TimeSlider = (props) => {
  const {
    title,
    values,
    timeRange,
    onChange,
    sliderProps,
    shouldUseDate,
    showControls,
  } = props;

  const [internalValues, setInternalValues] = useState(values);
  const [labelWidth, setLabelWidth] = useState(0);
  const [labelCollisionWidth, setLabelCollisionWidth] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [labelPosition, setLabelPosition] = useState({
    min: 0,
    max: 0,
  });
  const [collisionLabelPosition, setCollisionLabelPosition] = useState(0);
  const [areLabelsTooClose, setAreLabelsTooClose] = useState(false);

  const refSlider = useRef();
  const refMinLabel = useRef();
  const refCollisionLabel = useRef();

  const updateLabelPositions = useCallback(
    (newValues) => {
      const { posMin, posMax } = calculateLabelPositions(
        newValues,
        timeRange,
        labelWidth,
        sliderWidth
      );

      const doLabelsCollide = Math.abs(posMin - posMax) < labelWidth;
      if (doLabelsCollide) {
        setAreLabelsTooClose(true);
        const posX = calculateCollisionLabelPosition(
          newValues,
          timeRange,
          labelCollisionWidth,
          sliderWidth
        );

        setCollisionLabelPosition(posX);
        return;
      }

      setAreLabelsTooClose(false);
      setLabelPosition({ min: posMin, max: posMax });
    },
    [timeRange, labelWidth, sliderWidth]
  );

  const handleChange = useCallback(
    (newValues) => {
      updateLabelPositions(newValues);
      setInternalValues(newValues);
    },
    [updateLabelPositions]
  );

  // initialize label positions based on label and slider width
  useEffect(() => {
    if (refSlider.current && refMinLabel.current && refCollisionLabel.current) {
      const sliderWidth = refSlider.current.getBoundingClientRect().width;
      const labelWidth = refMinLabel.current.getBoundingClientRect().width;
      const labelCollisionWidth =
        refCollisionLabel.current.getBoundingClientRect().width;

      setLabelPosition({
        min: 0,
        max: sliderWidth - labelWidth,
      });

      setLabelCollisionWidth(labelCollisionWidth);
      setSliderWidth(sliderWidth);
      setLabelWidth(labelWidth);
    }
  }, []);

  // sync props with internal state and update label positions
  useEffect(() => {
    setInternalValues(values);
    updateLabelPositions(values);
  }, [values, updateLabelPositions]);

  return (
    <div className="timeslider-container">
      <div className="timeslider-control-container">
        <label>{title}</label>
        {showControls && (
          <TimeSliderControls
            min={timeRange[0]}
            max={timeRange[1]}
            values={internalValues}
            onChange={handleChange}
          />
        )}
      </div>
      <div ref={refSlider} className="slider-container">
        <Range
          allowCross={false}
          ariaLabelledByGroupForHandles={["min-value", "max-value"]}
          min={timeRange[0]}
          max={timeRange[1]}
          onChange={handleChange}
          onAfterChange={onChange}
          value={internalValues}
          {...sliderProps}
        />

        <Label
          className={clsx(
            "tooltip min-value",
            areLabelsTooClose && "labels-too-close"
          )}
          posX={labelPosition.min}
          ref={refMinLabel}
          value={!areLabelsTooClose ? internalValues[0] : STATIC_DUMMY[0]}
          shouldUseDate={shouldUseDate}
        />
        <Label
          className={clsx(
            "tooltip max-value",
            areLabelsTooClose && "labels-too-close"
          )}
          posX={labelPosition.max}
          value={!areLabelsTooClose ? internalValues[1] : STATIC_DUMMY[1]}
          shouldUseDate={shouldUseDate}
        />
        <Label
          className={clsx(
            "tooltip min-max-value",
            areLabelsTooClose && "labels-too-close"
          )}
          posX={collisionLabelPosition}
          ref={refCollisionLabel}
          value={areLabelsTooClose ? internalValues : STATIC_DUMMY}
          shouldUseDate={shouldUseDate}
        />
      </div>
    </div>
  );
};

TimeSlider.defaultProps = {
  timeRange: [1850, 1970],
  shouldUseDate: false,
  showControls: false,
};

TimeSlider.propTypes = {
  title: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.number),
  timeRange: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func.isRequired,
  sliderProps: PropTypes.object,
  shouldUseDate: PropTypes.bool,
  showControls: PropTypes.bool,
};

export default TimeSlider;
