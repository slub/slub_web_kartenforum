/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { mapState } from "@map/atoms";
import { CustomEvents } from "@map/components/VkfMap/constants";
import { isDefined } from "@util/util";

import "./OpacitySlider.scss";

export const OpacitySlider = (props) => {
  const { onEndDrag, onStartDrag, orientation = "horizontal", layer } = props;

  const map = useRecoilValue(mapState);
  const [value, setValue] = useState(layer.getOpacity(map) * 100);

  const valueRef = useRef(null);
  const baseMin = 0,
    baseMax = 100;

  /**
   *    @param {number} value
   *    @param {Element} element
   */
  const handleUpdatePosition = (value, element) => {
    if (orientation === "vertical") {
      var style_top = 100 - ((value - baseMin) / (baseMax - baseMin)) * 100;
      element.style.top = style_top + "%";
      element.innerHTML = value.toFixed(0) + "%";
      return;
    }

    const style_left = ((value - baseMin) / (baseMax - baseMin)) * 100;
    element.style.left = style_left + "%";
    element.innerHTML = value + "%";
  };

  const handleOpacityChange = (event) => {
    const { layerId } = event;
    if (layerId === layer.getId()) {
      const opacity = layer.getOpacity(map) * 100;

      setValue(opacity);
    }
  };

  const handleSliderChange = (value) => {
    setValue(value);
    if (isDefined(map)) {
      layer.setOpacity(map, value / 100);
    }
  };

  useEffect(() => {
    handleUpdatePosition(Math.round(value), valueRef.current);
  }, [value]);

  useEffect(() => {
    if (map) {
      map.on(CustomEvents.opacityChanged, handleOpacityChange);

      return () => {
        map.off(CustomEvents.opacityChanged, handleOpacityChange);
      };
    }
  }, [map]);

  return (
    <div className="opacity-container">
      <div className="slider-container">
        <Slider
          onAfterChange={onEndDrag}
          onBeforeChange={onStartDrag}
          onChange={handleSliderChange}
          value={value}
          vertical={orientation === "vertical"}
        />
        <div className="tooltip value" ref={valueRef}>
          100%
        </div>
      </div>
    </div>
  );
};

OpacitySlider.propTypes = {
  onEndDrag: PropTypes.func,
  onStartDrag: PropTypes.func,
  layer: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
};

export default OpacitySlider;
