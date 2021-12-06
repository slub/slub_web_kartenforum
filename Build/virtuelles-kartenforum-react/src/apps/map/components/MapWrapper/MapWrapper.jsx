/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Map } from "ol";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { defaults, DragRotateAndZoom } from "ol/interaction";
import XYZ from "ol/source/XYZ";
import OLCesium from "olcs/OLCesium";
import { useRecoilState, useRecoilValue } from "recoil";
import olcsCore from "olcs/core";
import clsx from "clsx";
import { useWindowWidth } from "@react-hook/window-size";

import {
  mapState,
  map3dState,
  olcsMapState,
  selectedFeaturesState,
} from "../../atoms/atoms";
import {
  createHistoricMapForFeature,
  generateLimitCamera,
  setOptimizedCesiumSettings,
  setShadowsActivated,
} from "./util";
import { getDefaultControls, isDefined } from "../../../../util/util";
import { updateButtonText } from "../../../../components/ToggleViewmode/ToggleViewmode";
import { getMapClassNameForLayout } from "../../layouts/util";

import "./MapWrapper.scss";
import "./openlayer-overwrites.scss";

export const MAP_DIV_ID = "mapdiv";

export function MapWrapper(props) {
  const {
    baseMapUrl,
    enable3d,
    enableTerrain,
    layout,
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
  const width = useWindowWidth();

  // refs
  const controlsRef = useRef();
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

    // create map
    const initialMap = new Map({
      controls: [],
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

      // set the terrain provider
      scene.terrainProvider = new Cesium.CesiumTerrainProvider({
        url: terrainTilesUrl,
        requestVertexNormals: true,
      });

      setOptimizedCesiumSettings(scene);
      // setShadowsActivated(scene);

      scene.postRender.addEventListener(generateLimitCamera(mapViewSettings));

      setOlcsMap(ol3d);
    }
  }, []);

  useEffect(() => {
    selectedFeatures.forEach((selectedFeature) => {
      const { displayedInMap = false, feature, opacity = 1 } = selectedFeature;

      if (!displayedInMap && feature.get("has_georeference")) {
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

  // update controls on layout change
  useEffect(() => {
    if (isDefined(map)) {
      if (isDefined(controlsRef.current)) {
        controlsRef.current.forEach((control) => {
          map.removeControl(control);
        });
      }

      const newControls = getDefaultControls({
        baseMapUrl,
        is3dActive,
        layout,
        mapViewSettings,
        set3dActive,
        toggleViewModeButtonRef,
      });

      newControls.forEach((control) => {
        map.addControl(control);
      });

      controlsRef.current = newControls;
    }
  }, [layout, map]);

  // fit map to viewport after resize (e.g switch from landscape to portrait mode)
  useEffect(() => {
    if (map !== undefined) {
      const timeout = setTimeout(() => {
        map.updateSize();
      }, 200);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [map, width]);

  return (
    <div className="map-container">
      <div
        id={MAP_DIV_ID}
        ref={mapElement}
        className={clsx("map-div", "olMap", getMapClassNameForLayout(layout))}
        tabIndex={0}
      />
    </div>
  );
}

MapWrapper.propTypes = {
  baseMapUrl: PropTypes.arrayOf(PropTypes.string),
  enable3d: PropTypes.bool,
  enableTerrain: PropTypes.bool,
  layout: PropTypes.string,
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
