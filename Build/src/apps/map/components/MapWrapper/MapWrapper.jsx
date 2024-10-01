/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Collection } from "ol";
import { useRecoilState, useSetRecoilState } from "recoil";
import clsx from "clsx";

import { getDefaultControls, isDefined } from "../../../../util/util";
import {
  activeBasemapIdState,
  baseMapStyleLayersState,
  mapState,
} from "../../atoms/atoms";
import { getMapClassNameForLayout } from "../../layouts/util";
import { useSetElementScreenSize } from "../../../../util/hooks";
import { notificationState } from "../../../../atoms/atoms";
import SettingsProvider from "../../../../SettingsProvider.js";
import BasemapSelectorControl from "../BasemapSelectorControl/BasemapSelectorControl.jsx";
import VkfMap from "../VkfMap/VkfMap.jsx";

import PermalinkExporter from "./components/PermalinkControl/PermalinkExporter.jsx";
import BasemapLayerApplier from "./components/BasemapLayerApplier.jsx";
import { getLocale } from "./locale.js";

import "maplibre-gl/dist/maplibre-gl.css";
import "./MapWrapper.scss";

const style =
  "https://tile-2.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/style.json";

export function MapWrapper(props) {
  const {
    baseMapUrl,
    ChildComponent,
    layout,
    mapViewSettings = {
      center: [13.5981217, 59.562795],
      projection: "EPSG:3857",
      zoom: 2,
    },
    onAddGeoJson,
    loadMarkerIcon = true,
  } = props;

  const initialBasemap = {
    id: "slub-osm",
    type: "xyz",
    urls: baseMapUrl,
  };

  // state
  const [activeBasemapId, setActiveBasemapId] =
    useRecoilState(activeBasemapIdState);

  // TODO CLEANUP - check if unsafe activeBasemap is still needed
  const [activeBasemap, setActiveBasemap] = useState(initialBasemap);
  const [map, setMap] = useRecoilState(mapState);

  const setBaseMapStyleLayers = useSetRecoilState(baseMapStyleLayersState);
  const setNotification = useSetRecoilState(notificationState);

  // refs
  const mapElement = useRef();

  // TODO CLEANUP - check if unsafe refs are still needed
  // used to make state easily accessible outside of the react tree in the permalink component
  // do not access otherwise
  const unsafe_refBasemapId = useRef(activeBasemapId);
  const unsafe_refApplicationStateUpdater = useRef(undefined);
  const unsafe_refSelectedFeatures = useRef(new Collection());
  const unsafe_refSpyLayer = useRef(undefined);
  // publish elements size to global state
  useSetElementScreenSize(mapElement, "map");

  ////
  // Handler section
  ////

  // update active basemap
  const handleBasemapChange = (newBasemapLayer) => {
    setActiveBasemapId(newBasemapLayer.id);
    setActiveBasemap(newBasemapLayer);
  };

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
      const newControls = getDefaultControls({
        layout,
        basemapSelectorProps: {
          onBasemapChange: handleBasemapChange,
          onSetNotification: setNotification,
        },
        permalinkProps: {
          refActiveBasemapId: unsafe_refBasemapId,
          refApplicationStateUpdater: unsafe_refApplicationStateUpdater,
          refSelectedFeatures: unsafe_refSelectedFeatures,
        },
        refSpyLayer: unsafe_refSpyLayer,
      });

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

  ////
  // Sync state with refs in order for the controls to get the state updates
  ////
  // TODO CLEANUP - commented code; check if still needed
  // useEffect(() => {
  //   // clear collection
  //   unsafe_refSelectedFeatures.current.clear();
  //   // add in selected features
  //   unsafe_refSelectedFeatures.current.extend(selectedFeatures);
  //   // mark as changed
  //   unsafe_refSelectedFeatures.current.changed();
  // }, [selectedFeatures]);

  return (
    <div className="map-container">
      <div
        ref={mapElement}
        className={clsx("map-div", "olMap", getMapClassNameForLayout(layout))}
        tabIndex={0}
      >
        {isDefined(map) && <ChildComponent onAddGeoJson={onAddGeoJson} />}
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
  onAddGeoJson: PropTypes.func,
  loadMarkerIcon: PropTypes.bool,
};

MapWrapper.propTypes = mapWrapperProps;

export default MapWrapper;
