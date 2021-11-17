/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useState, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

import { isDefined, translate } from "../../../util/util";
import { mapState } from "../../../atoms/atoms";
import { getHistoricMapLayer } from "../../MapWrapper/util";
import "./DynamicMapVisualization.scss";

const setLayersToInitialState = (sortedLayers) => {
  for (let key in sortedLayers) {
    if (sortedLayers.hasOwnProperty(key)) {
      const layersArr = sortedLayers[key];

      layersArr.forEach((layer) => {
        layer.setOpacity(0);
        layer.setVisible(true);
      });
    }
  }
};

const sortLayers = (layers, map) => {
  const sortedLayers = layers.sort((a, b) => {
    if (a.getTime() > b.getTime()) {
      return 1;
    }
    if (a.getTime() < b.getTime()) {
      return -1;
    }
    return 0;
  });

  const responseObj = {};
  sortedLayers.forEach((layer) => {
    // update layer order on map
    map.removeLayer(layer);
    map.addLayer(layer);

    // build responseObj
    const layerTime = layer.getTime();
    if (layerTime in responseObj) {
      responseObj[layerTime].push(layer);
    } else {
      responseObj[layerTime] = [layer];
    }
  });

  return responseObj;
};

export const DynamicMapVisualization = () => {
  const [active, setActive] = useState(false);
  const [animatedLayer, setAnimatedLayer] = useState(undefined);
  const [open, setOpen] = useState(false);
  const map = useRecoilValue(mapState);

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
      if (newOpacity <= 1.05) {
        layers.forEach((layer) => {
          layer.setOpacity(newOpacity);
        });
        setTimeout(() => {
          incrementalFadeIn(options);
        }, delay);
      } else {
        if (isDefined(successCallback)) {
          successCallback();
        }
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
          startAnimation({ sortedLayers: newSortedLayers, delay }), delay;
        };

        setTimeout(() => {
          startFadeInAnimation({ layers, successCallback }, delay);
        });

        setAnimatedLayer(currentKey);
      } else {
        setActive(false);
      }
    }
  };

  const handleStart = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleStop = (e) => {
    e.preventDefault();
    setActive(false);
  };

  const handleToggleMenu = (e) => {
    e.preventDefault();
    if (open) {
      setActive(false);
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    activeRef.current = active;
    if (active) {
      const layers = getHistoricMapLayer(map);
      const sortedLayers = sortLayers(layers, map);
      startAnimation({ sortedLayers });
    } else {
      setAnimatedLayer(undefined);
    }
  }, [active]);

  return (
    <div
      className={`dyn-vis-control ${active ? "play" : ""}`}
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

export default DynamicMapVisualization;
