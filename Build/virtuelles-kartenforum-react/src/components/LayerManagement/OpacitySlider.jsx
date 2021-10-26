/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef } from "react";

export const OpacitySlider = (props) => {
  const { orientation = "horizontal", layer } = props;
  const sliderRef = useRef();
  const valueRef = useRef();

  const baseMin = 0,
    baseMax = 100;
  const startValue = layer.getOpacity() * 100;

  /**
   * 	@param {number} value
   *	@param {Element} element
   */
  const handleUpdatePosition = (value, element) => {
    if (orientation == "vertical") {
      var style_top = 100 - ((value - baseMin) / (baseMax - baseMin)) * 100;
      element.style.top = style_top + "%";
      element.innerHTML = value + "%";
      return;
    }

    const style_left = ((value - baseMin) / (baseMax - baseMin)) * 100;
    element.style.left = style_left + "%";
    element.innerHTML = value + "%";
  };

  const handleOpacityChange = (event) => {
    const breakValue = 19;
    const opacity = event.target.getOpacity() * 100;
    //console.log('Opacity: ' + opacity + ', Slider value: ' + $(sliderEl).slider('value'));

    if (Math.abs(opacity - $(sliderRef.current).slider("value")) > breakValue) {
      $(sliderRef.current).slider("value", opacity);
    }
  };

  useEffect(() => {
    layer.on("change:opacity", handleOpacityChange);
    return () => {
      layer.un("change:opacity", handleOpacityChange);
    };
  });

  useEffect(() => {
    $(sliderRef.current).slider({
      min: 0,
      max: 100,
      value: startValue,
      animate: "slow",
      orientation: orientation,
      step: 1,
      slide: (event, ui) => {
        const value = ui["value"];
        handleUpdatePosition(value, valueRef.current);
        layer.setOpacity(value / 100);
        // @TODO: REFRESH 3D VIEW HERE
        // vk2.utils.refresh3DView();
      },
      change: (event, ui) => {
        const value = ui["value"];
        handleUpdatePosition(value, valueRef.current);
        layer.setOpacity(value / 100);
        // @TODO: REFRESH 3D VIEW HERE
        // vk2.utils.refresh3DView();
      },
    });
  }, []);

  // append slide behavior

  return (
    <div className="opacity-container">
      <div className="slider-container opacity-slider">
        <div className="slider" ref={sliderRef}>
          <div className="tooltip value" ref={valueRef}>
            100%
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpacitySlider;
