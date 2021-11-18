import { transformExtent } from "ol/proj";
import { containsXY } from "ol/extent";
import { FullScreen, Rotate, ScaleLine, Zoom } from "ol/control";
import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";

import { MousePositionOnOff } from "./components/MousePositionOnOff";
import RestoreDefaultView from "./components/RestoreDefaultView";
import CustomAttribution from "./components/CustomAttribution";
import ToggleViewMode from "../ToggleViewmode/ToggleViewmode";
import { LayerSpy } from "./components/LayerSpy";
import HistoricMap from "../layer/HistoricMapLayer";

export const generateLimitCamera = function (mapView) {
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
                destination: Cesium.Ellipsoid.WGS84.cartographicToCartesian(
                    pos
                ),
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

/**
 * Returns the default controls for the map view
 **/
export const getDefaultControls = ({
    baseMapUrl,
    is3dActive,
    mapViewSettings,
    set3dActive,
    toggleViewModeButtonRef,
}) => [
    new CustomAttribution(),
    new Zoom(),
    new FullScreen(),
    new Rotate({ className: "rotate-north ol-unselectable" }),
    new ToggleViewMode({
        initialState: is3dActive,
        propagateViewMode: set3dActive,
        toggleViewModeButtonRef,
    }),
    new LayerSpy({
        spyLayer: new TileLayer({
            attribution: undefined,
            source: new XYZ({
                urls: baseMapUrl,
                crossOrigin: "*",
                attributions: [],
            }),
        }),
    }),
    new RestoreDefaultView({ defaultView: mapViewSettings }),
    new ScaleLine(),
    new MousePositionOnOff(),
    // new vk2.control.Permalink(),
];

/**
 * @returns {Array.<vk2.layer.HistoricMap>}
 */
export const getHistoricMapLayer = function (map) {
    const layers = map.getLayers().getArray();
    const historicMapLayers = [];
    for (let i = 0; i < layers.length; i++) {
        if (layers[i] instanceof HistoricMap) {
            historicMapLayers.push(layers[i]);
        }
    }
    return historicMapLayers;
};

export const setOptimizedCesiumSettings = (scene) => {
    const { globe, screenSpaceCameraController } = scene;

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

    scene.fog.enabled = fogEnabled;
    scene.fog.density = fogDensity;
    scene.fog.screenSpaceErrorFactor = fogSseFactor;
};

export const setShadowsActivated = (scene) => {
    // together with the "requestVertexNormals" flag (see terrainProvider) it enables the displaying
    // of shadows on the map,
    scene.globe.enableLighting = true;
    scene.globe.lightingFadeInDistance = 1000000000;
    scene.globe.lightingFadeOutDistance = 10000000;
};
