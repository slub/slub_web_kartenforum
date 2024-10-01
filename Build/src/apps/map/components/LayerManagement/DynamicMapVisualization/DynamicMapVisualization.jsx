/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useState, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import clsx from "clsx";

import { isDefined, translate } from "../../../../../util/util";
import { mapState, selectedLayersState } from "../../../atoms/atoms";
import { groupLayers, setLayersToInitialState, sortLayers } from "./util";
import "./DynamicMapVisualization.scss";

export const DynamicMapVisualization = ({ animationOptions = {} }) => {
  // state
  const [active, setActive] = useState(false);
  const [animatedLayer, setAnimatedLayer] = useState(undefined);
  const [open, setOpen] = useState(false);
  const map = useRecoilValue(mapState);
  const title = translate(`dynamicmapvis-${open ? "close" : "open"}`);
  const [selectedLayers, setSelectedLayers] =
    useRecoilState(selectedLayersState);

  // refs
  const activeRef = useRef(false);

  const startFadeInAnimation = (options) => {
    const { layers, delay = 500 } = options;
    layers.forEach((layer) => {
      layer.setOpacity(map, 0);
      layer.setVisibility(map, "visible");
    });
    setTimeout(() => {
      incrementalFadeIn(options);
    }, delay);
  };

  const incrementalFadeIn = (options) => {
    const { layers, steps = 0.1, delay = 500, successCallback } = options;
    if (activeRef.current) {
      const newOpacity = (layers[0].getOpacity(map) ?? 0) + steps;
      if (newOpacity > 1) {
        layers.forEach((layer) => {
          layer.setOpacity(map, 1);
        });

        if (isDefined(successCallback)) {
          successCallback();
        }
      } else {
        layers.forEach((layer) => {
          layer.setOpacity(map, newOpacity);
        });
        setTimeout(() => {
          incrementalFadeIn(options);
        }, delay);
      }
    }
  };

  const startAnimation = (options) => {
    const { sortedLayers, delay = 500 } = options;

    setLayersToInitialState(sortedLayers, map);
    if (activeRef.current) {
      const keys = Object.keys(sortedLayers);
      if (keys.length > 0) {
        const currentKey = keys[0];
        const layers = sortedLayers[currentKey];

        // eslint-disable-next-line no-unused-vars
        const { [currentKey]: _, ...newSortedLayers } = sortedLayers;

        const successCallback = () => {
          startAnimation({ ...options, sortedLayers: newSortedLayers });
        };

        setTimeout(() => {
          startFadeInAnimation({ ...options, layers, successCallback }, delay);
        });

        setAnimatedLayer(currentKey);
      } else {
        handleStop();
      }
    }
  };

  ////
  // Handler section
  ////

  // handle animation start
  const handleStart = () => {
    setActive(true);
    activeRef.current = true;
    const sortedLayers = sortLayers(selectedLayers);
    const groupedLayers = groupLayers(sortedLayers, map);

    setSelectedLayers(sortedLayers);

    startAnimation({ ...animationOptions, sortedLayers: groupedLayers });
  };

  // handle animation stop
  const handleStop = () => {
    setActive(false);
    activeRef.current = false;
    setAnimatedLayer(undefined);
  };

  // Toggle open state of the menu
  const handleToggleMenu = (e) => {
    e.preventDefault();
    if (open) {
      handleStop();
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  ////
  //   Effect section
  ////

  const feedback =
    animatedLayer && animatedLayer.length > 4
      ? animatedLayer.split(" ")[2]
      : animatedLayer;

  return (
    <div
      className={clsx("vkf-dyn-vis-control", active && "play", open && "open")}
      title={title}
      aria-label={title}
      id="dynamic-map-visualization"
    >
      <button
        type="button"
        className="open-dyn-vis"
        onClick={handleToggleMenu}
        aria-labelledby="dynamic-map-visualization"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 30 30"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          alt={title}
        >
          <path
            className="arrow"
            d="M14.822,4.521c0.057,-0.014 0.117,-0.021 0.178,-0.021c1.561,0 3.047,0.348 4.385,0.97c1.342,0.611 2.573,1.513 3.589,2.699c0.83,0.969 1.452,2.052 1.868,3.192c0.425,1.136 0.658,2.363 0.658,3.639c0,1.561 -0.348,3.047 -0.97,4.385c-0.611,1.342 -1.513,2.573 -2.699,3.589c-0.969,0.83 -2.052,1.452 -3.192,1.868c-1.136,0.425 -2.363,0.658 -3.639,0.658c-1.561,0 -3.047,-0.348 -4.385,-0.97c-1.342,-0.611 -2.573,-1.513 -3.589,-2.699l-0.488,-0.569c-0.075,-0.088 -0.126,-0.188 -0.154,-0.292c-1.033,-1.48 -1.696,-3.234 -1.85,-5.122l-1.685,1.685c-0.293,0.293 -0.768,0.293 -1.061,0c-0.293,-0.292 -0.293,-0.768 0,-1.06l3,-3c0.293,-0.293 0.768,-0.293 1.061,0l3,3c0.292,0.292 0.292,0.768 0,1.06c-0.293,0.293 -0.768,0.293 -1.061,0l-1.754,-1.754c0.286,3.268 2.35,6.059 5.208,7.389c2.154,0.98 4.642,1.084 6.877,0.268c2.229,-0.835 4.051,-2.533 5.049,-4.678c0.98,-2.154 1.084,-4.642 0.268,-6.877c-0.835,-2.229 -2.533,-4.051 -4.678,-5.049c-3.095,-1.408 -6.88,-1.008 -9.613,1.333c-0.315,0.269 -0.788,0.233 -1.058,-0.082c-0.269,-0.314 -0.233,-0.788 0.082,-1.057c1.921,-1.646 4.287,-2.469 6.653,-2.505Z"
          />
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
          {feedback}
        </div>
        <button
          aria-label={translate("dynamicmapvis-start")}
          className="start-button"
          onClick={handleStart}
          tabIndex={open ? undefined : -1}
          title={translate("dynamicmapvis-start")}
          type="button"
        >
          Start
        </button>
        <button
          aria-label={translate("dynamicmapvis-stop")}
          className="stop-button"
          onClick={handleStop}
          tabIndex={open ? undefined : -1}
          title={translate("dynamicmapvis-stop")}
          type="button"
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
