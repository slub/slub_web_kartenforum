/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useState, useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";

import "./MapWrapper.scss";
import { SettingsProvider } from "./index";

function MapWrapper(props) {
  const settings = SettingsProvider.getSettings();

  // set intial state
  const [map, setMap] = useState();

  // pull refs
  const mapElement = useRef();

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource(),
    });

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        // USGS Topo
        new TileLayer({
          source: new XYZ({
            urls: settings.OSM_URLS,
          }),
        }),
        initalFeaturesLayer,
      ],
      view: new View({
        projection: "EPSG:3857",
        center: [0, 0],
        zoom: 2,
      }),
      controls: [],
    });

    setMap(initialMap);
  }, []);

  // render component
  return <div ref={mapElement} className="map-container" />;
}

export default MapWrapper;
