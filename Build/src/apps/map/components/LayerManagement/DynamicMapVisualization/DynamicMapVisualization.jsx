/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useState, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";

import { isDefined, translate } from "../../../../../util/util";
import { mapState } from "../../../atoms/atoms";
import { getOperationalLayers } from "../../MapWrapper/util";
import { setLayersToInitialState, sortLayers } from "./util";
import "./DynamicMapVisualization.scss";

export const DynamicMapVisualization = ({ animationOptions = {} }) => {
  // state
  const [active, setActive] = useState(false);
  const [animatedLayer, setAnimatedLayer] = useState(undefined);
  const [open, setOpen] = useState(false);
  const map = useRecoilValue(mapState);

  // refs
  const activeRef = useRef(false);

  const startFadeInAnimation = (options) => {
    const { layers, delay = 500 } = options;
    layers.forEach((layer) => {
      layer.setOpacity(0);
      layer.setVisible(true);
    });
    setTimeout(() => {
      incrementalFadeIn(options);
    }, delay);
  };

  const incrementalFadeIn = (options) => {
    const { layers, steps = 0.1, delay = 500, successCallback } = options;
    if (activeRef.current) {
      const newOpacity = layers[0].getOpacity() + steps;
      if (newOpacity > 1) {
        layers.forEach((layer) => {
          layer.setOpacity(1);
        });

        if (isDefined(successCallback)) {
          successCallback();
        }
      } else {
        layers.forEach((layer) => {
          layer.setOpacity(newOpacity);
        });
        setTimeout(() => {
          incrementalFadeIn(options);
        }, delay);
      }
    }
  };

  const startAnimation = (options) => {
    const { sortedLayers, delay = 500 } = options;

    setLayersToInitialState(sortedLayers);
    if (activeRef.current) {
      const keys = Object.keys(sortedLayers);
      if (keys.length > 0) {
        const currentKey = keys[0];
        const layers = sortedLayers[currentKey];

        const { [currentKey]: _, ...newSortedLayers } = sortedLayers;

        const successCallback = () => {
          startAnimation({ ...options, sortedLayers: newSortedLayers });
        };

        setTimeout(() => {
          startFadeInAnimation({ ...options, layers, successCallback }, delay);
        });

        setAnimatedLayer(currentKey);
      } else {
        setActive(false);
      }
    }
  };

  ////
  // Handler section
  ////

  // handle animation start
  const handleStart = (e) => {
    e.preventDefault();
    setActive(true);
  };

  // handle animation stop
  const handleStop = (e) => {
    e.preventDefault();
    setActive(false);
  };

  // Toggle open state of the menu
  const handleToggleMenu = (e) => {
    e.preventDefault();
    if (open) {
      setActive(false);
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  ////
  //   Effect section
  ////

  // Handle start/stop of animation based on active state
  useEffect(() => {
    activeRef.current = active;
    if (active) {
      const layers = getOperationalLayers(map);
      const sortedLayers = sortLayers(layers, map);
      startAnimation({ ...animationOptions, sortedLayers });
    } else {
      setAnimatedLayer(undefined);
    }
  }, [active]);

  return (
    <div
      className={`vkf-dyn-vis-control ${active ? "play" : ""}`}
      title={translate(`dynamicmapvis-${open ? "close" : "open"}`)}
    >
      <button className="open-dyn-vis" onClick={handleToggleMenu}>
        o
      </button>
      <div className="content" style={{ display: open ? undefined : "none" }}>
        {animatedLayer !== undefined && (
          <div className="feedback">{animatedLayer} </div>
        )}
        <div className="start-container">
          <button
            onClick={handleStart}
            title={translate("dynamicmapvis-start")}
          >
            Start
          </button>
        </div>
        <div className="stop-container">
          <button onClick={handleStop} title={translate("dynamicmapvis-stop")}>
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

DynamicMapVisualization.propTypes = {
  animationOptions: PropTypes.shape({
    delay: PropTypes.number,
    steps: PropTypes.number,
  }),
};

export default DynamicMapVisualization;
