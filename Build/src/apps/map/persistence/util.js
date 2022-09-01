/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */
import { useEffect, useState } from "react";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { extend } from "ol/extent";
import { toLonLat } from "ol/proj";
import { fromLonLat } from "ol/proj";

import {
    deserializeGeojson,
    serializeGeojson,
} from "../components/GeoJsonEditPopUp/util/geojsonSerializer";
import { LAYER_TYPES } from "../components/CustomLayers/LayerTypes";
import { isDefined } from "../../../util/util";
import { MAP_PROJECTION } from "../components/MapSearch/MapSearch.jsx";
import { isValidLonLat } from "./validation.js";

/**
 * Transform the map view in case of invalid lon/lat values
 * => interpret coordinates as MapProjection in this case
 * @param mapView
 * @returns {{center: number[]}}
 */
export const adjustMapView = (mapView) => {
    const { center, position, ...rest } = mapView;

    const adjustedMapView = {};

    if (center !== undefined) {
        const [lon, lat] = center;
        adjustedMapView["center"] = isValidLonLat(lon, lat)
            ? fromLonLat(center, MAP_PROJECTION)
            : center;
    }

    if (position !== undefined) {
        const { x, y, z } = position;

        adjustedMapView["position"] = isValidLonLat(x, y)
            ? Cesium.Cartesian3.fromDegrees(x, y, z)
            : position;
    }

    return Object.assign(adjustedMapView, rest);
};

/**
 * Checks if all values of an object are either undefined or objects without entries
 * @param o
 * @return {this is unknown[]}
 */
export const areAllUndefined = (o) =>
    Object.values(o).every(
        (x) => x === undefined || Object.entries(x).length === 0
    );

/**
 * Cap length of numbers within a structure to the given number of digits
 * @param el
 * @param digits
 * @returns {{}|string|*|string}
 */
const beautifyElement = (el, digits = 4) => {
    if (Array.isArray(el)) {
        return el.map((x) => beautifyElement(x, digits));
    } else if (typeof el === "object" && el !== null) {
        const result = {};
        Object.entries(el).forEach(([k, v]) => {
            result[k] = beautifyElement(v);
        });

        return result;
    } else if (isNaN(el) || el === null) {
        return el;
    } else {
        return el.toFixed(Math.min(countDecimals(el), digits));
    }
};

const beautifyMapView = (mapView, digits = 4) => {
    const beautifiedMapView = {};

    Object.entries(mapView).forEach(([k, v]) => {
        beautifiedMapView[k] = beautifyElement(v, digits);
    });

    return beautifiedMapView;
};

const countDecimals = (value) => {
    if (Math.floor(value) === value) {
        return 0;
    } else {
        return value.toString().split(".")[1].length || 0;
    }
};

/**
 * Deserializes an operationalLayer from a supplied persistence object
 * @param coordinates
 * @param isVisible
 * @param opacity
 * @return {{displayedInMap: boolean, feature: Feature, isVisible: boolean, opacity}}
 */
export const deSerializeOperationalLayer = ({
    isVisible,
    opacity,
    type,
    ...featureSpecific
}) => {
    return {
        displayedInMap: false,
        feature:
            type === LAYER_TYPES.GEOJSON
                ? deserializeGeojsonLayer(featureSpecific)
                : deserializeMapLayer(featureSpecific),
        isVisible,
        opacity,
        type,
    };
};

export const deserializeGeojsonLayer = ({ id, geojson, properties }) => {
    const { geometry, ...rest } = properties;

    const feature = new Feature({
        geojsonFeatures: deserializeGeojson(geojson),
        ...rest,
    });

    feature.setId(id);

    return feature;
};

export const deserializeMapLayer = ({ coordinates, id, properties }) => {
    const feature = new Feature({ geometry: new Polygon(coordinates) });
    feature.setId(id);
    const { geometry, ...rest } = properties;
    feature.setProperties(rest);
    return feature;
};

/**
 * Fits the map view to an array of features
 * @param map
 * @param features
 */
export const fitMapToFeatures = (map, features) => {
    let boundingExtent;
    features.forEach((feature) => {
        const featureBoundingExtent = feature.getGeometry().getExtent();
        boundingExtent =
            boundingExtent === undefined
                ? featureBoundingExtent
                : extend(boundingExtent, featureBoundingExtent);
    });

    if (boundingExtent !== undefined) {
        map.getView().fit(boundingExtent, { padding: [50, 350, 50, 350] });
    }
};

/**
 * Joins two path parameters which might be arrays
 * @param a
 * @param b
 * @return {*[]}
 */
export const joinArrayPathParameters = (a, b) => {
    let result;

    if (a === undefined) {
        result = b;
    } else if (b === undefined) {
        result = a;
    } else {
        const isaArray = Array.isArray(a);
        const isbArray = Array.isArray(b);

        const intermediateA = isaArray ? a : [a];
        const intermediateB = isbArray ? b : [b];

        // remove duplicates
        result = Array.from(new Set([...intermediateA, ...intermediateB]));
    }

    return result;
};

/**
 * Serializes an operational layer
 * @param feature
 * @param type - type of the layer
 * @param mapLayer
 * @return {{coordinates: *, id: *, isVisible: *, opacity: *, properties: *}}
 */
export const serializeOperationalLayer = ({ feature, type }, mapLayer) => {
    const isVisible = mapLayer.getVisible();
    const opacity = mapLayer.getOpacity();

    const base = {
        id: feature.getId(),
        isVisible,
        opacity,
        properties: feature.getProperties(),
    };

    if (type === LAYER_TYPES.GEOJSON) {
        const {
            properties: { geojsonFeatures, ...rest },
        } = base;

        const newGeojsonFeatures = mapLayer.getSource().getFeatures();

        // add in geojson specific parts
        return Object.assign(base, {
            geojson: serializeGeojson(newGeojsonFeatures),
            type: LAYER_TYPES.GEOJSON,
            properties: rest,
        });
    } else {
        // add in map specific parts
        return Object.assign(base, {
            coordinates: feature.getGeometry().getCoordinates(),
            type: LAYER_TYPES.HISTORIC_MAP,
        });
    }
};

export const serializeMapView = (
    camera,
    map,
    is3dEnabled,
    beautify = false
) => {
    const view = map.getView();
    if (is3dEnabled) {
        // from cartesian coordinates to cartographic (in radians)
        const cartographic = Cesium.Cartographic.fromCartesian(camera.position);
        // convert radians to degrees
        const positionInDegrees = {
            x: Cesium.Math.toDegrees(cartographic.longitude),
            y: Cesium.Math.toDegrees(cartographic.latitude),
            z: cartographic.height,
        };

        // assemble mapView
        const mapView = {
            position: positionInDegrees,
            direction: camera.direction,
            up: camera.up,
            right: camera.right,
        };

        return beautify ? beautifyMapView(mapView, 5) : mapView;
    } else {
        // assemble mapView
        const mapView = {
            center: toLonLat(view.getCenter(), MAP_PROJECTION),
            resolution: view.getResolution(),
            rotation: view.getRotation(),
            zoom: view.getZoom(),
        };

        return beautify ? beautifyMapView(mapView) : mapView;
    }
};

/**
 * Updates the camera from a mapview object and ignores undefined properties
 * @param camera
 * @param mapView
 */
export const updateCameraFromMapview = (camera, mapView) => {
    const { direction, position, right, up } = mapView;

    updateCameraProperty("direction", direction, camera);
    updateCameraProperty("position", position, camera);
    updateCameraProperty("right", right, camera);
    updateCameraProperty("up", up, camera);
};

/**
 * update a single property if the new value is defined
 * @param property
 * @param value
 * @param camera
 */
const updateCameraProperty = (property, value, camera) => {
    if (isDefined(value)) {
        camera[property] = value;
    }
};

/**
 * Allow access to local storage
 * found here: https://usehooks-typescript.com/react-hook/use-local-storage
 * @param {String} key
 * @param {Object} initialValue
 */
export function useLocalStorage(key, initialValue) {
    // Get from local storage then
    // parse stored json or return initialValue
    const readValue = () => {
        // Prevent build error "window is undefined" but keep keep working
        if (typeof window === "undefined") {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    };

    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(readValue);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
        // Prevent build error "window is undefined" but keeps working
        if (typeof window == "undefined") {
            console.warn(
                `Tried setting localStorage key “${key}” even though environment is not a client`
            );
        }

        try {
            // Allow value to be a function so we have the same API as useState
            const newValue =
                value instanceof Function ? value(storedValue) : value;

            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(newValue));

            // Save state
            setStoredValue(newValue);

            // We dispatch a custom event so every useLocalStorage hook are notified
            window.dispatchEvent(new Event("local-storage"));
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    };

    useEffect(() => {
        setStoredValue(readValue());
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            setStoredValue(readValue());
        };

        // this only works for other documents, not the current one
        window.addEventListener("storage", handleStorageChange);

        // this is a custom event, triggered in writeValueToLocalStorage
        window.addEventListener("local-storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("local-storage", handleStorageChange);
        };
    }, []);

    return [storedValue, setValue];
}

/**
 * Allows the invocation of an event handler before the window unloads
 * found here: https://stackoverflow.com/questions/66713004/react-execute-function-on-website-exit-without-giving-an-alert-warning
 *
 * @param {function} handler - eventHandler called before unload of the window
 */
export const useOnPageLeave = (handler) => {
    useEffect(() => {
        const terminationEvent =
            "onpagehide" in window.self ? "pagehide" : "unload";
        window.addEventListener(terminationEvent, handler, { capture: true });

        return () => {
            window.removeEventListener(terminationEvent, handler, {
                capture: true,
            });
        };
    }, [handler]);
};

/**
 * Wraps a set of features for the usage in the selected features state
 * @param features
 * @return {*}
 */
export const wrapMapFeatures = (features) =>
    features.map((feature) => ({
        feature,
        displayedInMap: false,
        type: LAYER_TYPES.HISTORIC_MAP,
    }));
