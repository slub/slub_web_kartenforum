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
import { MousePositionOnOff } from "./components/MousePositionOnOff";
import CustomAttribution from "./components/CustomAttribution";
import ToggleViewMode from "../ToggleViewmode/ToggleViewmode";
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

  const selectedFeatures = useRecoilValue(selectedFeaturesState);

  const [is3dActive, set3dActive] = useRecoilState(map3dState);
  const [map, setMap] = useRecoilState(mapState);
  const [olcsMap, setOlcsMap] = useRecoilState(olcsMapState);

  // pull refs
  const mapElement = useRef();

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    const view = new View(mapViewSettings);

    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource(),
    });

    const controls = [
      new CustomAttribution(),
      new Zoom(),
      new FullScreen(),
      new Rotate({ className: "rotate-north ol-unselectable" }),
      new ToggleViewMode({
        initialState: is3dActive,
        propagateViewMode: set3dActive,
        view,
      }),
      new ScaleLine(),
      new MousePositionOnOff(),
      // new vk2.control.Permalink(),
    ];

    // Add spy layer

    //     controls.push(
    //       new vk2.control.LayerSpy({
    //         spyLayer: new ol.layer.Tile({
    //           attribution: undefined,
    //           source: new ol.source.XYZ({
    //             urls: vk2.settings.OSM_URLS,
    //             crossOrigin: "*",
    //             attributions: [],
    //           }),
    //         }),
    //       })
    //     );
    //   }

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

      // // set this global because it is used by other application code
      // window["ol3d"] = ol3d;

      // some test code
      const tileCacheSize = "100",
        // The maximum screen-space error used to drive level-of-detail refinement. Higher values will provide better performance but lower visual quality.
        // Default is 2
        maximumScreenSpaceError = 1.5,
        fogEnabled = true,
        fogDensity = 0.000003880708760225126 * 20,
        fogSseFactor = 25 * 2;

      window["minimumRetrievingLevel"] = 8;
      window["imageryAvailableLevels"] = undefined;
      globe["baseColor"] = Cesium.Color.WHITE;
      globe["tileCacheSize"] = tileCacheSize;
      globe["maximumScreenSpaceError"] = maximumScreenSpaceError;
      scene.backgroundColor = Cesium.Color.WHITE;
      globe.depthTestAgainstTerrain = true;
      screenSpaceCameraController.maximumZoomDistance = 300000; //4000000;

      scene.terrainProvider = new Cesium.CesiumTerrainProvider({
        url: terrainTilesUrl,
        requestVertexNormals: true,
      });
      scene.fog.enabled = fogEnabled;
      scene.fog.density = fogDensity;
      scene.fog.screenSpaceErrorFactor = fogSseFactor;

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
      const { displayedInMap = false, feature } = selectedFeature;

      if (!displayedInMap && feature.get("georeference")) {
        map.addLayer(createHistoricMapForFeature(feature));
        if (is3dActive) {
          const historicMapClipFeature = createClipFeature(
            feature.getGeometry().clone(),
            feature.getId(),
            feature.get("time"),
            feature.get("title")
          );
          // historicMapClickLayer_.getSource().addFeature(historicMapClipFeature);
        }

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

            view.setResolution(view.constrainResolution(resolution));
            view.setRotation(view.constrainRotation(rotation));
          },
        });
      }
    }
  }, [is3dActive]);

  // render component
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
  mapViewSettings: {
    center: [PropTypes.number, PropTypes.number],
    projection: PropTypes.string,
    zoom: PropTypes.number,
  },
  terrainTilesUrl: PropTypes.string,
};

export default MapWrapper;

/**
 * @returns {Array.<vk2.layer.HistoricMap>}
 */
export const getHistoricMapLayer = function (map, is3d) {
  const layers = map.getLayers().getArray();
  const historicMapLayers = [];
  for (let i = 0; i < layers.length; i++) {
    if (is3d) {
      if (layers[i] instanceof HistoricMap3D) {
        historicMapLayers.push(layers[i]);
      }
    } else {
      if (layers[i] instanceof HistoricMap) {
        historicMapLayers.push(layers[i]);
      }
    }
  }
  return historicMapLayers;
};

// @TODO: Correctly port this.

/**
 * Checks if the layer collection already contains a layer with that id.
 *
 * @param {string} id
 * @param {ol.Collection} layers
 * @return {boolean}
 */
export const containsLayerWithId = function (id, layers) {
  const array = layers.getArray();
  for (let i = 0; i < array.length; i++) {
    if (
      array[i] instanceof vk2.layer.HistoricMap ||
      array[i] instanceof vk2.layer.HistoricMap3D
    ) {
      if (array[i].getId() == id) {
        return true;
      }
    }
  }
  return false;
};

/**
 * @param {ol.Feature} feature
 * @return {vk2.layer.HistoricMap}
 * @private
 */
export const createHistoricMapForFeature = function (feature, is3d, map) {
  const settings = SettingsProvider.getSettings();

  const tms_url_subdomains = settings["TMS_URL_SUBDOMAINS"];
  const thumbnail = feature.get("thumb") ?? settings["THUMB_PATH"];

  const maxZoom =
    feature.get("denominator") == 0
      ? 15
      : feature.get("denominator") <= 5000
      ? 17
      : feature.get("denominator") <= 15000
      ? 16
      : 15;
  return is3d
    ? new HistoricMap(
        {
          maxZoom: maxZoom,
          time: feature.get("time"),
          title: feature.get("title"),
          objectid: feature.get("id"),
          id: feature.getId(),
          dataid: feature.get("dataid"),
          tms: feature.get("tms"),
          clip: feature.getGeometry().clone(),
          thumbnail,
          tms_url_subdomains,
        },
        map
      )
    : new HistoricMap(
        {
          time: feature.get("time"),
          maxZoom: maxZoom,
          title: feature.get("title"),
          objectid: feature.get("id"),
          id: feature.getId(),
          dataid: feature.get("dataid"),
          tms: feature.get("tms"),
          clip: feature.getGeometry().clone(),
          thumbnail,
          tms_url_subdomains,
        },
        map
      );
};

/**
 * @param {vk2.tool.Permalink} permalink
 */
export const registerPermalinkTool = function (permalink) {
  // couple permalink module with map
  goog.events.listen(
    permalink,
    vk2.tool.PermalinkEventType.ADDMAP,
    function (event) {
      var feature = event.target["feature"];

      // request associated messtischblaetter for a blattnr
      if (feature.get("georeference") === true) {
        this.map_.addLayer(this.createHistoricMapForFeature_(feature));

        if (vk2.utils.is3DMode()) {
          // add vector geometry for the given historic map to a special layer for simulate 3d mode experience
          var feature = vk2.layer.HistoricMap.createClipFeature(
            feature.getGeometry().clone(),
            feature.getId(),
            feature.get("time"),
            feature.get("title")
          );
          this.historicMapClickLayer_.getSource().addFeature(feature);
        }
      }
    },
    undefined,
    this
  );

  // parse permalink if one exists
  permalink.parsePermalink(this.map_);
};

/**
 * @param {vk2.module.SpatialTemporalSearchModule} spatialTemporalSearchModule
 */
const registerSpatialTemporalSearch = function (spatialTemporalSearchModule) {
  /**
   * @type {vk2.module.MapSearchModule}
   * @private
   */
  this.mapsearch_ = spatialTemporalSearchModule.getMapSearchModule();

  //
  // Initialize an historic map click layer which is only used in case of 3d mode
  //

  /**
   * @type {ol.layer.Vector|undefined}
   * @private
   */
  this.historicMapClickLayer_ = vk2.utils.is3DMode()
    ? new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: function (feature, resolution) {
          return [
            new ol.style.Style({
              fill: new ol.style.Fill({
                color: "rgba(255, 255, 255, 0.0)",
              }),
            }),
          ];
        },
      })
    : undefined;

  if (this.historicMapClickLayer_ !== undefined) {
    // in case 3d mode is active add altitude value to coordinate
    this.historicMapClickLayer_.set("altitudeMode", "clampToGround");
    this.historicMapClickLayer_.set("type", "click");

    // hold the overlay layer on top of the historic map layers
    this.map_.getLayers().on(
      "add",
      function (event) {
        var topLayer = event.target.getArray()[event.target.getLength() - 1];
        if (
          topLayer instanceof vk2.layer.HistoricMap ||
          topLayer instanceof vk2.layer.HistoricMap3D
        ) {
          this.map_.removeLayer(this.historicMapClickLayer_);
          this.map_.addLayer(this.historicMapClickLayer_);
        }
      },
      this
    );

    this.map_.addLayer(this.historicMapClickLayer_);
  }

  // register gazetteer tool
  goog.events.listen(
    spatialTemporalSearchModule.getGazetteerSearchTool(),
    "jumpto",
    function (event) {
      var lonlat = event.target["lonlat"],
        center = ol.proj.transform(
          [parseFloat(lonlat[0]), parseFloat(lonlat[1])],
          event.target["srs"],
          vk2.settings.MAPVIEW_PARAMS["projection"]
        );

      this.map_.zoomTo(center, 6);
    },
    undefined,
    this
  );
};

/**
 * @param {Array.<ol.Feature>} features
 * @static
 */
const showMapProfile = function (features) {
  if (features.length > 0) {
    var modal = new vk2.utils.Modal("vk2-overlay-modal", document.body, true);
    modal.open(undefined, "mapcontroller-click-modal");

    var section = goog.dom.createDom("section");
    for (var i = 0; i < features.length; i++) {
      var anchor = goog.dom.createDom("a", {
        href: vk2.utils.routing.getMapProfileRoute(features[i].getId()),
        innerHTML: features[i].get("title") + " " + features[i].get("time"),
        target: "_self",
      });
      goog.dom.appendChild(section, anchor);
      goog.dom.appendChild(section, goog.dom.createDom("br"));
    }
    modal.appendToBody(section, "map-profile");

    if (features.length == 1) anchor.click();
  }
};
