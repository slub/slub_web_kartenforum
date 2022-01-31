/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useState, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import clsx from "clsx";

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
      className={clsx("vkf-dyn-vis-control", active && "play", open && "open")}
      title={translate(`dynamicmapvis-${open ? "close" : "open"}`)}
    >
      <button className="open-dyn-vis" onClick={handleToggleMenu}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 30 30"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="arrow">
            <path d="M15,25.5c5.76,0 10.5,-4.74 10.5,-10.5c0,-5.76 -4.74,-10.5 -10.5,-10.5c-5.76,0 -10.5,4.74 -10.5,10.5l0,0.75c-0,0.414 0.336,0.75 0.75,0.75c0.414,0 0.75,-0.336 0.75,-0.75l0,-0.75c0,-4.937 4.063,-9 9,-9c4.937,0 9,4.063 9,9c0,4.937 -4.063,9 -9,9c-0.414,0 -0.75,0.336 -0.75,0.75c0,0.414 0.336,0.75 0.75,0.75Z" />
            <path d="M1.846,13.527l3,3c0.293,0.293 0.768,0.293 1.061,0l3,-3c0.292,-0.292 0.292,-0.768 -0,-1.06c-0.293,-0.293 -0.768,-0.293 -1.061,-0l-2.47,2.469c0,0 -2.469,-2.469 -2.469,-2.469c-0.293,-0.293 -0.768,-0.293 -1.061,-0c-0.293,0.292 -0.293,0.768 -0,1.06Z" />
          </g>
          <path
            className="minute-hand"
            d="M14.238,8.795l0,5.47c0,0.414 0.336,0.75 0.75,0.75c0.414,0 0.75,-0.336 0.75,-0.75l0,-5.47c0,-0.414 -0.336,-0.75 -0.75,-0.75c-0.414,-0 -0.75,0.336 -0.75,0.75Z"
          />
          <path
            className="hour-hand"
            d="M21.18,14.263l-5.47,-0c-0.414,-0 -0.75,0.336 -0.75,0.75c-0,0.413 0.336,0.75 0.75,0.75l5.47,-0c0.414,-0 0.75,-0.337 0.75,-0.75c0,-0.414 -0.336,-0.75 -0.75,-0.75Z"
          />
        </svg>
      </button>
      <div className="content">
        <div
          className={clsx("feedback", animatedLayer !== undefined && "running")}
        >
          {animatedLayer}
        </div>
        <button
          onClick={handleStart}
          title={translate("dynamicmapvis-start")}
          className="start-button"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          title={translate("dynamicmapvis-stop")}
          className="stop-button"
        >
          Stop
        </button>
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
