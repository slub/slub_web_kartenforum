/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Slider from "rc-slider";
import { useRecoilValue } from "recoil";
import Tile from "ol/layer/Tile";
import "rc-slider/assets/index.css";

import HistoricMap from "../../apps/map/components/CustomLayers/HistoricMapLayer.js";
import { olcsMapState } from "../../apps/map/atoms/atoms.js";
import GeoJsonLayer from "../../apps/map/components/CustomLayers/GeoJsonLayer.js";
import "./OpacitySlider.scss";

export const OpacitySlider = (props) => {
  const { onEndDrag, onStartDrag, orientation = "horizontal", layer } = props;
  const olcsMap = useRecoilValue(olcsMapState);
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

    if (olcsMap !== undefined) {
      olcsMap.getAutoRenderLoop().restartRenderLoop();
    }
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

OpacitySlider.propTypes = {
  onEndDrag: PropTypes.func,
  onStartDrag: PropTypes.func,
  layer: PropTypes.oneOfType([
    PropTypes.instanceOf(HistoricMap),
    PropTypes.instanceOf(GeoJsonLayer),
    PropTypes.instanceOf(Tile),
  ]),
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
};

export default OpacitySlider;
