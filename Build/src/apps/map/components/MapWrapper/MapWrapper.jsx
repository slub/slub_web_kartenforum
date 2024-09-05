/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Collection, Map } from "ol";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { defaults, DragRotate } from "ol/interaction";
import { shiftKeyOnly } from "ol/events/condition";
import { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import olcsCore from "olcs/core";
import clsx from "clsx";
import { useWindowWidth } from "@react-hook/window-size";
import RasterSynchronizer from "olcs/RasterSynchronizer";
import VectorSynchronizer from "olcs/VectorSynchronizer";
import OverlaySynchronizer from "olcs/OverlaySynchronizer.js";

import { createBaseMapLayer } from "../../../../util/geo";
import {
  getDefaultControls,
  isDefined,
  translate,
} from "../../../../util/util";
import {
  activeBasemapIdState,
  currentApplicationStateState,
  map3dState,
  mapState,
  olcsMapState,
  selectedFeaturesState,
  selectedGeoJsonFeatureState,
} from "../../atoms/atoms";
import {
  createHistoricMapForFeature,
  generateLimitCamera,
  setOptimizedCesiumSettings,
} from "./util";
import { getMapClassNameForLayout, LAYOUT_TYPES } from "../../layouts/util";
import { useSetElementScreenSize } from "../../../../util/hooks";
import GeoJsonLayer from "../CustomLayers/GeoJsonLayer";
import customFeatureConverter from "./components/customFeatureConverter/customFeatureConverter";
import { LAYER_TYPES } from "../CustomLayers/LayerTypes";
import { notificationState } from "../../../../atoms/atoms";
import "./MapWrapper.scss";
import SettingsProvider from "../../../../SettingsProvider.js";
import CustomEvents from "./customEvents.js";
import customEvents from "./customEvents.js";

const style =
  "https://tile-2.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/style.json";

export function MapWrapper(props) {
  const {
    baseMapUrl,
    ChildComponent,
    disableClickHandler = false,
    enable3d,
    enableTerrain,
    layout,
    mapViewSettings = {
      center: [13.5981217, 59.562795],
      projection: "EPSG:3857",
      zoom: 2,
    },
    onAddGeoJson,
    terrainTilesService,
  } = props;

  const initialBasemap = {
    id: "slub-osm",
    type: "xyz",
    urls: baseMapUrl,
  };

  // state
  const [activeBasemapId, setActiveBasemapId] =
    useRecoilState(activeBasemapIdState);
  const [activeBasemap, setActiveBasemap] = useState(initialBasemap);
  const [is3dActive, set3dActive] = useRecoilState(map3dState);
  const localStorageWriter = useRecoilValue(currentApplicationStateState);
  const [map, setMap] = useRecoilState(mapState);
  const setOlcsMap = useSetRecoilState(olcsMapState);
  const setSelectedGeoJsonFeature = useSetRecoilState(
    selectedGeoJsonFeatureState
  );
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );
  const setNotification = useSetRecoilState(notificationState);
  const width = useWindowWidth();

  // refs
  const controlsRef = useRef();
  const mapElement = useRef();
  const olcsMapRef = useRef();
  const refDialogEditFeature = useRef();

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

  // toggle viewmode from 2d to 3d and vice versa
  const handleChangeViewMode = (new3dStateGenerator) => {
    let new3dState;
    set3dActive((oldState) => {
      new3dState = new3dStateGenerator(oldState);
      return new3dState;
    });

    const ol3d = olcsMapRef.current;

    if (ol3d !== undefined) {
      if (new3dState) {
        const scene = ol3d.getCesiumScene(),
          camera = scene.camera,
          bottom = olcsCore.pickBottomPoint(scene),
          angle = Cesium.Math.toRadians(50),
          transform = Cesium.Matrix4.fromTranslation(bottom);

        if (ol3d.getEnabled()) return;
        // 2d -> 3d transition
        ol3d.setEnabled(true);

        // take care that every time the view is reset when zoom out
        olcsCore.rotateAroundAxis(camera, -angle, camera.right, transform, {
          duration: 500,
        });
      } else {
        if (!ol3d.getEnabled()) return;

        const scene = ol3d.getCesiumScene(),
          camera = scene.camera,
          bottom = olcsCore.pickBottomPoint(scene),
          transform = Cesium.Matrix4.fromTranslation(bottom),
          angle = olcsCore.computeAngleToZenith(scene, bottom);

        // 3d -> 2d transition
        olcsCore.rotateAroundAxis(camera, -angle, camera.right, transform, {
          callback: function () {
            ol3d.setEnabled(false);
            const view = ol3d.getOlMap().getView();
            const resolution = view.getResolution();
            const rotation = view.getRotation();

            // constraints apply on setting them
            view.setResolution(resolution);
            view.setRotation(rotation);
          },
        });
      }
    }
  };

  //@TODO: Handle map click for geojson feature
  // open overlay on map click and supply it with the first feature under the cursor
  // const handleMapClick = useCallback(
  //   (e) => {
  //     const pixel = e.pixel;
  //
  //     let newSelectedFeature;
  //
  //     // handle selection process depending on viewmode
  //     if (!is3dActive) {
  //       // use ol api for 2d
  //       newSelectedFeature = map.forEachFeatureAtPixel(
  //         pixel,
  //         (feature) => feature
  //       );
  //     } else {
  //       // use cesium api for 3d
  //       const pickedFeature = olcsMapRef.current
  //         .getCesiumScene()
  //         .pick(new Cesium.Cartesian2(pixel[0], pixel[1]));
  //
  //       if (pickedFeature !== undefined)
  //         newSelectedFeature = pickedFeature.primitive.olFeature;
  //     }
  //
  //     if (isDefined(newSelectedFeature)) {
  //       setSelectedGeoJsonFeature(newSelectedFeature);
  //     } else {
  //       // hide overlay
  //       setSelectedGeoJsonFeature(null);
  //     }
  //   },
  //   [is3dActive, map]
  // );

  ////
  // Effect section
  ////

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    const initialMap = new MaplibreMap({
      container: mapElement.current,
      center: mapViewSettings.center,
      zoom: mapViewSettings.zoom,
      style,
    });

    setMap(initialMap);

    if (enable3d && enableTerrain) {
    }

    const originalAddLayer = initialMap.addLayer;
    const originalRemoveLayer = initialMap.removeLayer;
    const originalSetPaintProperty = initialMap.setPaintProperty;
    const originalSetLayoutProperty = initialMap.setLayoutProperty;
    const originalMoveLayer = initialMap.moveLayer;

    initialMap.addLayer = function (layer, before) {
      // Call the original method
      originalAddLayer.call(this, layer, before);

      // Emit a custom event or trigger some action
      this.fire(CustomEvents.layerAdded, { layerId: layer.id });
    };

    // Override the removeLayer method
    initialMap.removeLayer = function (layerId) {
      // Call the original method
      originalRemoveLayer.call(this, layerId);

      // Emit a custom event or trigger some action
      this.fire(CustomEvents.layerRemoved, { layerId: layerId });
    };

    initialMap.moveLayer = function (layerId, beforeId) {
      // Call the original method
      originalMoveLayer.call(this, layerId, beforeId);

      // Emit a custom event or trigger some action
      this.fire(CustomEvents.layerMoved, {
        layerId: layerId,
        beforeId: beforeId,
      });
    };

    // Override setPaintProperty to listen for opacity changes
    initialMap.setPaintProperty = function (layerId, property, value) {
      // Call the original method
      originalSetPaintProperty.call(this, layerId, property, value);

      // Check if the property being changed is an opacity-related property
      const opacityProperties = [
        "fill-opacity",
        "line-opacity",
        "circle-opacity",
        "icon-opacity",
        "text-opacity",
        "raster-opacity",
      ];

      if (opacityProperties.includes(property)) {
        // Emit a custom event
        this.fire(customEvents.opacityChanged, {
          layerId: layerId,
          property: property,
          value: value,
        });
      }
    };

    // Override setLayoutProperty to listen for visibility changes
    initialMap.setLayoutProperty = function (layerId, property, value) {
      // Call the original method
      originalSetLayoutProperty.call(this, layerId, property, value);

      // Check if the property being changed is a visibility-related property
      const visibilityProperties = ["visibility"];

      if (visibilityProperties.includes(property)) {
        // Emit a custom event
        this.fire(customEvents.visibilityChanged, {
          layerId: layerId,
          property: property,
          value: value,
        });
      }
    };

    return () => {
      setMap(undefined);
      initialMap.remove();
    };
  }, []);

  useEffect(() => {
    selectedFeatures.forEach((selectedFeature) => {
      const {
        displayedInMap = false,
        feature,
        isVisible = true,
        opacity = 1,
        type,
      } = selectedFeature;

      if (!displayedInMap && feature.get("has_georeference")) {
        try {
          const prom =
            type === LAYER_TYPES.GEOJSON
              ? new Promise((resolve) => resolve(new GeoJsonLayer({ feature })))
              : createHistoricMapForFeature(feature, map);

          // prom.then((layer) => {
          //   layer.allowUseInLayerManagement = true;
          //
          //   layer.setOpacity(opacity);
          //   layer.setVisible(isVisible);
          //   map.addLayer(layer);
          // });
          selectedFeature.displayedInMap = true;
        } catch (e) {
          // there was an error mounting the layer => remove the selected feature and display an errror message
          setNotification({
            id: "map-wrapper",
            type: "danger",
            text: translate("mapwrapper-mount-layer-error"),
          });

          setSelectedFeatures((oldSelectedFeatures) =>
            oldSelectedFeatures.filter(
              (f) => f.feature.getId() !== feature.getId()
            )
          );
        }
      }
    });
  }, [selectedFeatures]);

  // useEffect(() => {
  //   if (isDefined(controlsRef.current)) {
  //     controlsRef.current.forEach((control) => {
  //       const updateFn = control.handleExternal3dStateUpdate;
  //       if (updateFn !== undefined) {
  //         updateFn(is3dActive);
  //       }
  //     });
  //   }
  // }, [is3dActive]);

  // update the basemap selector state externally
  // useEffect(() => {
  //   if (isDefined(controlsRef.current) && isDefined(map)) {
  //     controlsRef.current.forEach((control) => {
  //       const updateFn = control.handleExternalBasemapUpdate;
  //       if (updateFn !== undefined) {
  //         updateFn(activeBasemapId);
  //       }
  //     });
  //   }
  // }, [activeBasemapId, map]);

  // @TODO: Reenable controls
  // update controls on layout change
  useEffect(() => {
    //   // only add new controls if the first time there is an activeBasemapId available and if the layout changes
    if (isDefined(map)) {
      //     if (isDefined(controlsRef.current)) {
      //       controlsRef.current.forEach((control) => {
      //         map.removeControl(control);
      //       });
      //     }
      //
      const newControls = getDefaultControls({
        is3dActive,
        layout,
        basemapSelectorProps: {
          onBasemapChange: handleBasemapChange,
          onSetNotification: setNotification,
        },
        onViewModeChange: handleChangeViewMode,
        permalinkProps: {
          camera: olcsMapRef.current?.getCesiumScene().camera,
          refActiveBasemapId: unsafe_refBasemapId,
          refApplicationStateUpdater: unsafe_refApplicationStateUpdater,
          refSelectedFeatures: unsafe_refSelectedFeatures,
        },
        refSpyLayer: unsafe_refSpyLayer,
      });

      //
      newControls.forEach(({ control, position }) => {
        map.addControl(control, position);
        //
        //       // handle external state updates
        //       let updateFn = control.handleExternalBasemapUpdate;
        //       if (updateFn !== undefined) {
        //         updateFn(activeBasemapId);
        //       }
        //
        //       updateFn = control.handleExternal3dStateUpdate;
        //       if (updateFn !== undefined) {
        //         updateFn(is3dActive);
        //       }
      });
      //
      //     controlsRef.current = newControls;
    }
  }, [layout, map]);

  // fit map to viewport after resize (e.g switch from landscape to portrait mode)
  // useEffect(() => {
  //   if (map !== undefined) {
  //     const timeout = setTimeout(() => {
  //       map.updateSize();
  //     }, 200);
  //     return () => {
  //       clearTimeout(timeout);
  //     };
  //   }
  // }, [map, width]);

  // bind click handler to map
  // useEffect(() => {
  //   if (
  //     map !== undefined &&
  //     layout === LAYOUT_TYPES.HORIZONTAL &&
  //     !disableClickHandler
  //   ) {
  //     map.on("click", handleMapClick);
  //
  //     return () => {
  //       map.un("click", handleMapClick);
  //     };
  //   }
  // }, [handleMapClick, layout, map]);

  ////
  // Sync state with refs in order for the controls to get the state updates
  ////

  // useEffect(() => {
  //   // clear collection
  //   unsafe_refSelectedFeatures.current.clear();
  //   // add in selected features
  //   unsafe_refSelectedFeatures.current.extend(selectedFeatures);
  //   // mark as changed
  //   unsafe_refSelectedFeatures.current.changed();
  // }, [selectedFeatures]);

  // useEffect(() => {
  //   if (map !== undefined && unsafe_refSpyLayer.current !== undefined) {
  //     unsafe_refSpyLayer.current.changeLayer(createBaseMapLayer(activeBasemap));
  //   }
  // }, [activeBasemap, map]);

  // useEffect(() => {
  //   unsafe_refApplicationStateUpdater.current = localStorageWriter;
  // }, [localStorageWriter]);
  //
  // useEffect(() => {
  //   unsafe_refBasemapId.current = activeBasemapId;
  // }, [activeBasemapId]);

  return (
    <div className="map-container">
      <div
        ref={mapElement}
        className={clsx("map-div", "olMap", getMapClassNameForLayout(layout))}
        tabIndex={0}
      >
        {isDefined(map) && <ChildComponent onAddGeoJson={onAddGeoJson} />}
      </div>
    </div>
  );
}

export const mapWrapperProps = {
  baseMapUrl: PropTypes.arrayOf(PropTypes.string),
  ChildComponent: PropTypes.func,
  disableClickHandler: PropTypes.bool,
  enable3d: PropTypes.bool,
  enableTerrain: PropTypes.bool,
  layout: PropTypes.string,
  mapViewSettings: PropTypes.shape({
    center: PropTypes.arrayOf(PropTypes.number),
    projection: PropTypes.string,
    zoom: PropTypes.number,
  }),
  onAddGeoJson: PropTypes.func,
  terrainTilesService: PropTypes.shape({
    asset: PropTypes.number,
    token: PropTypes.string,
    type: PropTypes.oneOf(["cesium", "maptiler"]).isRequired,
    url: PropTypes.string,
  }),
};

MapWrapper.propTypes = mapWrapperProps;

export default MapWrapper;
