import { transformExtent } from "ol/proj";
import { containsXY } from "ol/extent";

import HistoricMap3D from "../layer/HistoricMapLayer3d";
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
