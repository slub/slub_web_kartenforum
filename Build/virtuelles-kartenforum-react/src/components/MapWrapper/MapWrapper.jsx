/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Map } from "ol";
import { transformExtent } from "ol/proj";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { FullScreen, Rotate, ScaleLine, Zoom } from "ol/control";
import { defaults, DragRotateAndZoom } from "ol/interaction";
import XYZ from "ol/source/XYZ";
import OLCesium from "olcs/OLCesium";
import { useRecoilState, useRecoilValue } from "recoil";
import { containsXY } from "ol/extent";
import olcsCore from "olcs/core";

import {
  mapState,
  map3dState,
  olcsMapState,
  selectedFeaturesState,
} from "../../atoms/atoms";
import HistoricMap, { createClipFeature } from "../layer/HistoricMapLayer";
import { SettingsProvider } from "../../index";
import HistoricMap3D from "../layer/HistoricMapLayer3d";
import LayerManagement from "../LayerManagement/LayerManagement";
import {
  createHistoricMapForFeature,
  generateLimitCamera,
  getDefaultControls,
  setOptimizedCesiumSettings,
  setShadowsActivated,
} from "./util";
import { isDefined } from "../../util/util";
import { updateButtonText } from "../ToggleViewmode/ToggleViewmode";

import "./MapWrapper.scss";
import "./openlayer-overwrites.scss";

export function MapWrapper(props) {
  const {
    baseMapUrl,
    enable3d,
    enableTerrain,
    mapViewSettings = {
      center: [1528150, 6630500],
      projection: "EPSG:3857",
      zoom: 2,
    },
    terrainTilesUrl,
  } = props;

  // state
  const [is3dActive, set3dActive] = useRecoilState(map3dState);
  const [map, setMap] = useRecoilState(mapState);
  const [olcsMap, setOlcsMap] = useRecoilState(olcsMapState);
  const selectedFeatures = useRecoilValue(selectedFeaturesState);

  // refs
  const mapElement = useRef();
  const toggleViewModeButtonRef = useRef();

  ////
  // Effect section
  ////

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    const view = new View(mapViewSettings);

    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource(),
    });

    const controls = getDefaultControls({
      baseMapUrl,
      is3dActive,
      mapViewSettings,
      set3dActive,
      toggleViewModeButtonRef,
    });

    // create map
    const initialMap = new Map({
      controls,
      layers: [
        // USGS Topo
        new TileLayer({
          source: new XYZ({
            crossOrigin: "*",
            maxZoom: 18,
            urls: baseMapUrl,
          }),
        }),
        initalFeaturesLayer,
      ],
      interactions: defaults().extend([new DragRotateAndZoom()]),
      renderer: "canvas",
      target: mapElement.current,
      view,
    });

    setMap(initialMap);

    if (enable3d && enableTerrain) {
      //
      // Some code regarding the 3d capabilities is based on the work of https://github.com/geoadmin/mf-geoadmin3
      //

      //// initialize the globe
      const ol3d = new OLCesium({
        map: initialMap,
        sceneOptions: {
          scene3DOnly: true,
          terrainExaggeration: 2.0,
        },
      });

      ol3d.enableAutoRenderLoop();

      // initialize a terrain map
      const scene = ol3d.getCesiumScene();
      const { globe, screenSpaceCameraController } = scene;

      // set the terrain provider
      scene.terrainProvider = new Cesium.CesiumTerrainProvider({
        url: terrainTilesUrl,
        requestVertexNormals: true,
      });

      setOptimizedCesiumSettings(scene);
      // setShadowsActivated(scene);

      scene.postRender.addEventListener(generateLimitCamera(mapViewSettings));

      // together with the "requestVertexNormals" flag (see terrainProvider) it enables the displaying
      // of shadows on the map,
      // scene.globe.enableLighting = true;
      // scene.globe.lightingFadeInDistance = 1000000000;
      // scene.globe.lightingFadeOutDistance = 10000000;

      setOlcsMap(ol3d);
    }

    // register click handler

    // mapRef.current.on('singleclick', function(event){
    //
    //   const features = [];
    //   if (is3dActive) {
    //     // special behavior for mode 3d
    //     const clickCoordinate = mapRef.current.getCoordinateFromPixel(event.pixel);
    //     features = this.historicMapClickLayer_.getSource().getFeaturesAtCoordinate(clickCoordinate);
    //   } else {
    //     this.getMap().forEachFeatureAtPixel(event['pixel'], function(feature){
    //       features.push(feature);
    //     });
    //   }
    //
    //   if (goog.DEBUG)
    //     console.log(features);
    //
    //   vk2.module.MapModule.showMapProfile(features);
    // }, this);
  }, []);

  useEffect(() => {
    selectedFeatures.forEach((selectedFeature) => {
      const { displayedInMap = false, feature, opacity = 1 } = selectedFeature;

      if (!displayedInMap && feature.get("georeference")) {
        const layer = createHistoricMapForFeature(feature);
        layer.setOpacity(opacity);
        map.addLayer(layer);
        selectedFeature.displayedInMap = true;
      }
    });
  }, [selectedFeatures]);

  useEffect(() => {
    if (olcsMap !== undefined) {
      if (is3dActive) {
        const ol3d = olcsMap,
          scene = ol3d.getCesiumScene(),
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
        const ol3d = olcsMap,
          scene = ol3d.getCesiumScene(),
          camera = scene.camera,
          bottom = olcsCore.pickBottomPoint(scene),
          transform = Cesium.Matrix4.fromTranslation(bottom),
          angle = olcsCore.computeAngleToZenith(scene, bottom);

        if (!ol3d.getEnabled()) return;

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
  }, [is3dActive]);

  useEffect(() => {
    if (isDefined(toggleViewModeButtonRef.current)) {
      updateButtonText(toggleViewModeButtonRef.current, is3dActive);
    }
  }, [is3dActive]);

  return (
    <div
      id="mapdiv"
      ref={mapElement}
      className="map-container olMap"
      tabIndex={0}
    >
      <LayerManagement />
    </div>
  );
}

const generateLimitCamera = function (mapView) {
  console.log(mapView);
  const extent4326 = transformExtent(
    mapView.extent,
    mapView.projection,
    "EPSG:4326"
  ).map(function (angle) {
    return (angle * Math.PI) / 180;
  });

  return function (scene) {
    const camera = scene.camera;
    const screenSpaceCameraController = scene.screenSpaceCameraController;
    const pos = camera.positionCartographic.clone();
    const inside = containsXY(extent4326, pos.longitude, pos.latitude);
    if (!inside) {
      // add a padding based on the camera height
      const maxHeight = screenSpaceCameraController.maximumZoomDistance;
      const padding = (pos.height * 0.05) / maxHeight;
      pos.longitude = Math.max(extent4326[0] - padding, pos.longitude);
      pos.latitude = Math.max(extent4326[1] - padding, pos.latitude);
      pos.longitude = Math.min(extent4326[2] + padding, pos.longitude);
      pos.latitude = Math.min(extent4326[3] + padding, pos.latitude);
      camera.setView({
        destination: Cesium.Ellipsoid.WGS84.cartographicToCartesian(pos),
        orientation: {
          heading: camera.heading,
          pitch: camera.pitch,
        },
      });
    }
    // Set the minimumZoomDistance according to the camera height
    screenSpaceCameraController.minimumZoomDistance =
      pos.height > 1800 ? 400 : 200;
  };
};

MapWrapper.propTypes = {
  baseMapUrl: PropTypes.arrayOf(PropTypes.string),
  enable3d: PropTypes.bool,
  enableTerrain: PropTypes.bool,
  mapViewSettings: {
    center: [PropTypes.number, PropTypes.number],
    projection: PropTypes.string,
    zoom: PropTypes.number,
  },
  terrainTilesUrl: PropTypes.string,
};

export default MapWrapper;

// // @TODO: Correctly port this.
// /**
//  * @param {vk2.tool.Permalink} permalink
//  */
// export const registerPermalinkTool = function (permalink) {
//   // couple permalink module with map
//   goog.events.listen(
//     permalink,
//     vk2.tool.PermalinkEventType.ADDMAP,
//     function (event) {
//       var feature = event.target["feature"];

//       // request associated messtischblaetter for a blattnr
//       if (feature.get("georeference") === true) {
//         this.map_.addLayer(this.createHistoricMapForFeature_(feature));

//         if (vk2.utils.is3DMode()) {
//           // add vector geometry for the given historic map to a special layer for simulate 3d mode experience
//           var feature = vk2.layer.HistoricMap.createClipFeature(
//             feature.getGeometry().clone(),
//             feature.getId(),
//             feature.get("time"),
//             feature.get("title")
//           );
//           this.historicMapClickLayer_.getSource().addFeature(feature);
//         }
//       }
//     },
//     undefined,
//     this
//   );

//   // parse permalink if one exists
//   permalink.parsePermalink(this.map_);
// };

// /**
//  * @param {Array.<ol.Feature>} features
//  * @static
//  */
// const showMapProfile = function (features) {
//   if (features.length > 0) {
//     var modal = new vk2.utils.Modal("vk2-overlay-modal", document.body, true);
//     modal.open(undefined, "mapcontroller-click-modal");

//     var section = goog.dom.createDom("section");
//     for (var i = 0; i < features.length; i++) {
//       var anchor = goog.dom.createDom("a", {
//         href: vk2.utils.routing.getMapProfileRoute(features[i].getId()),
//         innerHTML: features[i].get("title") + " " + features[i].get("time"),
//         target: "_self",
//       });
//       goog.dom.appendChild(section, anchor);
//       goog.dom.appendChild(section, goog.dom.createDom("br"));
//     }
//     modal.appendToBody(section, "map-profile");

//     if (features.length == 1) anchor.click();
//   }
// };
