/**
 * Created by pouria.rezaei@pikobytes.de on 01.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
// @TODO: Remove this component after migrating the georeferencer to MapLibre.
// This temporary component ensures proper functionality of the opacity slider in the georeference map.

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Slider from "rc-slider";
import Tile from "ol/layer/Tile";
import "rc-slider/assets/index.css";
import "./OpacitySlider.scss";

export const OpenLayerOpacitySlider = (props) => {
  const { onEndDrag, onStartDrag, orientation = "horizontal", layer } = props;
  const [value, setValue] = useState(layer.getOpacity() * 100);

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
    const opacity = event.target.getOpacity() * 100;

    setValue(opacity);
  };

  const handleSliderChange = (value) => {
    setValue(value);
    layer.setOpacity(value / 100);
  };

  useEffect(() => {
    handleUpdatePosition(Math.round(value), valueRef.current);
  }, [value]);

  useEffect(() => {
    layer.on("change:opacity", handleOpacityChange);
    return () => {
      layer.un("change:opacity", handleOpacityChange);
    };
  });

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

OpenLayerOpacitySlider.propTypes = {
  onEndDrag: PropTypes.func,
  onStartDrag: PropTypes.func,
  layer: PropTypes.oneOfType([PropTypes.instanceOf(Tile)]),
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
};

export default OpenLayerOpacitySlider;
