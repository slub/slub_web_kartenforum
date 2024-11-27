/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useRecoilState, useSetRecoilState } from "recoil";
import clsx from "clsx";

import { getDefaultControls, isDefined } from "@util/util";
import { baseMapStyleLayersState, mapState } from "@map/atoms";
import { getMapClassNameForLayout } from "@map/layouts/util";
import { useSetElementScreenSize } from "@util/hooks";

import SettingsProvider from "@settings-provider";
import BasemapSelectorControl from "@map/components/BasemapSelectorControl";
import VkfMap from "@map/components/VkfMap";

import PermalinkExporter from "./components/PermalinkControl/PermalinkExporter.jsx";
import BasemapLayerApplier from "./components/BasemapLayerApplier.jsx";
import { getLocale } from "./locale.js";

import "maplibre-gl/dist/maplibre-gl.css";
import "./MapWrapper.scss";

const style =
  "https://tile-2.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/style.json";

export function MapWrapper(props) {
  const {
    ChildComponent,
    layout,
    mapViewSettings = {
      center: [13.5981217, 59.562795],
      projection: "EPSG:3857",
      zoom: 2,
    },
    loadMarkerIcon = true,
  } = props;

  const [map, setMap] = useRecoilState(mapState);
  const setBaseMapStyleLayers = useSetRecoilState(baseMapStyleLayersState);

  // refs
  const mapElement = useRef();

  // publish elements size to global state
  useSetElementScreenSize(mapElement, "map");

  ////
  // Effect section
  ////

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    const initialMap = new VkfMap({
      container: mapElement.current,
      center: mapViewSettings.center,
      zoom: mapViewSettings.zoom,
      maxZoom: mapViewSettings.maxZoom,
      style,
      locale: getLocale(),
      attributionControl: false,
    });

    // Wait for the style to be fully loaded
    const handleStyleLoad = () => {
      setMap(initialMap);
      setBaseMapStyleLayers(initialMap.getStyle().layers);

      if (loadMarkerIcon === true) {
        const { id, url } = SettingsProvider.getMarkerSettings();
        initialMap.loadImage(url).then((image) => {
          initialMap.addImage(id, image.data, { sdf: true });
        });
      }
    };

    // Add event listener for style load
    initialMap.on("style.load", handleStyleLoad);

    return () => {
      // Clean up event listener and remove map on unmount
      initialMap.off("style.load", handleStyleLoad);
      setMap(undefined);
      initialMap.remove();
    };
  }, []);

  useEffect(() => {
    if (isDefined(map)) {
      const newControls = getDefaultControls();

      newControls.forEach(({ control, position }) => {
        map.addControl(control, position);
      });

      return () => {
        newControls.forEach(({ control }) => {
          map.removeControl(control);
        });
      };
    }
  }, [map]);

  return (
    <div className="map-container">
      <div
        ref={mapElement}
        className={clsx("map-div", "olMap", getMapClassNameForLayout(layout))}
        tabIndex={0}
      >
        {isDefined(map) && <ChildComponent />}
        <BasemapSelectorControl />
        <PermalinkExporter />
        <BasemapLayerApplier />
      </div>
    </div>
  );
}

export const mapWrapperProps = {
  baseMapUrl: PropTypes.arrayOf(PropTypes.string),
  ChildComponent: PropTypes.func,
  layout: PropTypes.string,
  mapViewSettings: PropTypes.shape({
    center: PropTypes.arrayOf(PropTypes.number),
    projection: PropTypes.string,
    zoom: PropTypes.number,
  }),
  loadMarkerIcon: PropTypes.bool,
};

MapWrapper.propTypes = mapWrapperProps;

export default MapWrapper;
