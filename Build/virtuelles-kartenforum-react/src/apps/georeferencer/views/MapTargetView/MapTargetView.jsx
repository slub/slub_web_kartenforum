/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import axios from "axios";
import PropTypes from "prop-types";
import DragZoom from "ol/src/interaction/DragZoom";
import Fullscreen from "ol/src/control/FullScreen";
import { defaults as defaultInteractions } from "ol/src/interaction";
import Map from "ol/src/Map";
import Tile from "ol/src/layer/Tile";
import View from "ol/src/View";
import Zoom from "ol/src/control/Zoom";
import XYZ from "ol/src/source/XYZ";
import "ol/ol.css";
import "./MapTargetView.scss";

export const MapTargetView = (props) => {
  const { urlNominatim, urlsOsmBaseMap } = props;
  const refMapContainer = useRef(null);

  // Effect for initial loading of the map with the zoomify layer
  useEffect(() => {
    const performInit = async () => {
      // Create the base layer
      const baseLayer = new Tile({
        source: new XYZ({
          urls: urlsOsmBaseMap,
          crossOrigin: "*",
          maxZoom: 18,
        }),
      });

      // Create the map object
      const map = new Map({
        controls: [new Fullscreen(), new Zoom()],
        interactions: defaultInteractions().extend([new DragZoom()]),
        layers: [baseLayer],
        target: refMapContainer.current,
        view: new View({
          projection: "EPSG:3857",
          center: [871713, 6396955],
          zoom: 4.3,
        }),
      });
    };

    if (refMapContainer.current !== null) {
      performInit();
    }
  }, []);

  return (
    <div className="vk-mapview-target">
      <div className="map-container" ref={refMapContainer} />
    </div>
  );
};

MapTargetView.propTypes = {
  urlNominatim: PropTypes.string,
  urlsOsmBaseMap: PropTypes.arrayOf(PropTypes.string),
};

export default MapTargetView;
