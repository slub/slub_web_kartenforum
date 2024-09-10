import { transformExtent } from "ol/proj";
import { containsXY } from "ol/extent";
import axios from "axios";

import SettingsProvider from "../../../../SettingsProvider";
import { addHistoricMapLayer } from "../CustomLayers/HistoricMapLayer";
import { UNIQUE_CONTROL_PANEL_CLASS } from "../Controls/BasemapSelectorControl.jsx";
import { fetchAndParseWmsCapabilities } from "../BasemapSelector/util.js";
import { LAYER_TYPES } from "../CustomLayers/LayerTypes.js";

/**
 * Fetches the maximum zoom value from an XML file located at the specified URL.
 *
 * @param {string} url - The URL of the tilemapresource.
 * @return {number} The maximum zoom value.
 */
const fetchMaxZoomFromTileMapSource = async (url) => {
    try {
        const response = await axios.get(`${url}/tilemapresource.xml`);
        const xmlDoc = new DOMParser().parseFromString(
            response.data,
            "text/xml"
        );
        const tileSets = xmlDoc.getElementsByTagName("TileSet");
        return tileSets.length;
    } catch (error) {
        console.error("Error fetching or parsing XML:", error);
        return null;
    }
};

/**
 * @param {Feature} feature
 * @return {vk2.layer.HistoricMap}
 * @private
 */
export const createHistoricMapForFeature = async function (feature, map) {
    const tms_urls = feature.get("tms_urls");
    const wms_capability_url = feature
        .get("online_resources")
        .find((resource) => resource.type === "WMS").url;

    const isTmsDefined = Array.isArray(tms_urls) && tms_urls.length > 0;

    const type = feature.get("type");

    const baseSettings = {
        clip: feature.getGeometry(),
        id: feature.getId(),
        scale: feature.get("map_scale"),
        thumb_url:
            feature.get("thumb_url") ??
            SettingsProvider.getSettings()["FALLBACK_THUMBNAIL"],
        title: feature.get("title"),
        time_published: feature.get("time_published"),
        type:
            type === undefined
                ? isTmsDefined
                    ? "single_sheet"
                    : "mosaic"
                : type,
        sourceId: feature.getSourceId(),
    };

    if (isTmsDefined) {
        // The zoom level starts with 0 till maxZoom - 1
        const maxZoom = (await fetchMaxZoomFromTileMapSource(tms_urls[0])) - 1;
        const historicMapSettings = Object.assign(baseSettings, {
            tms_urls,
            maxZoom,
        });
        addHistoricMapLayer(historicMapSettings, map);
    } else {
        const layers = await fetchAndParseWmsCapabilities(wms_capability_url);

        const wms_settings = {
            tiles: layers[0].urls,
        };

        addHistoricMapLayer(Object.assign(baseSettings, { wms_settings }), map);
    }
};

/**
 * Create a single sheet preview layer used in the mosaic map application part
 * @param feature
 * @returns {Promise<vk2.layer.HistoricMap>}
 */
export const createSingleSheetPreviewForFeature = async function (feature) {
    const newLayer = await createHistoricMapForFeature(feature);
    newLayer.allowUseInLayerManagement = true;
    newLayer.set("type", LAYER_TYPES.PREVIEW);
    newLayer.set("layer_type", LAYER_TYPES.PREVIEW);
    return newLayer;
};

export const getControlFeedbackContainer = (
    map,
    opt_selector = "control-feedback-container"
) => {
    let targetEl = document.getElementById(opt_selector);

    // creat target element
    if (targetEl === null) {
        const viewport = map.getCanvasContainer();

        targetEl = document.createElement("div");
        targetEl.id = opt_selector;

        viewport.appendChild(targetEl);
    }

    return targetEl;
};

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
                destination:
                    Cesium.Ellipsoid.WGS84.cartographicToCartesian(pos),
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

export const generateControlToggleHandler =
    (renderOptions, clickAwayHandler) => (e) => {
        const { defaultClass, element } = renderOptions;

        // hide all panels but this
        hideUniquePanels(element);

        const isActive = element.classList.contains("active");

        if (e !== undefined) {
            e.preventDefault();
            e.stopPropagation();
        }

        // add click away listener
        if (clickAwayHandler !== undefined) {
            if (!isActive) {
                document.addEventListener("click", clickAwayHandler);
            }
        }

        element.className = isActive ? defaultClass : `${defaultClass} active`;
    };

export const getUniqueControlPanels = () => {
    return document.getElementsByClassName(UNIQUE_CONTROL_PANEL_CLASS);
};

export const hideUniquePanels = (element) => {
    Array.from(getUniqueControlPanels()).forEach((el) => {
        if (element !== el) {
            el.classList.remove("active");
        }
    });
};

export const setOptimizedCesiumSettings = (scene) => {
    const { globe, screenSpaceCameraController } = scene;

    const tileCacheSize = "100", // The maximum screen-space error used to drive level-of-detail refinement. Higher values will provide better performance but lower visual quality.
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
