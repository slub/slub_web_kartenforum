/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */
import { useEffect, useState } from "react";

import {
    HistoricMapLayer,
    GeoJsonLayer,
    LAYER_TYPES,
    METADATA,
} from "@map/components/CustomLayers";
import { isDefined } from "@util/util";
import { LngLatBounds } from "maplibre-gl";
import { emptyFeatureCollection } from "@map/components/GeoJson/constants";

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
 * @return {{displayedInMap: boolean, feature: HistoricMapLayer|GeoJsonLayer, isVisible: boolean, opacity}}
 */
export const deSerializeOperationalLayer = ({
    isVisible,
    opacity,
    type,
    ...featureSpecific
}) => {
    return {
        feature:
            type === LAYER_TYPES.VECTOR_MAP || type === LAYER_TYPES.GEOJSON
                ? deserializeGeojsonLayer(featureSpecific)
                : deserializeMapLayer(featureSpecific),
        isVisible,
        opacity,
        type,
    };
};

export const deserializeGeojsonLayer = ({ geometry, geojson, properties }) => {
    return new GeoJsonLayer({
        metadata: properties,
        geoJSON: geojson ?? structuredClone(emptyFeatureCollection),
        geometry,
    });
};

export const deserializeMapLayer = ({ geometry, properties }) => {
    return new HistoricMapLayer({ metadata: properties, geometry });
};

/**
 * Fits the map view to an array of features
 * @param map
 * @param features
 */
export const fitMapToFeatures = (map, features) => {
    let boundingExtent;
    features.forEach((feature) => {
        const featureBoundingExtent = feature.getMetadata(METADATA.bounds);
        boundingExtent =
            boundingExtent === undefined
                ? new LngLatBounds(featureBoundingExtent)
                : boundingExtent.extend(featureBoundingExtent);
    });

    //@TODO: Adjust for mobile layout
    if (boundingExtent !== undefined) {
        map.fitBounds(boundingExtent, {
            animate: false,
            padding: { left: 350, right: 350, top: 50, bottom: 50 },
        });
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
 * @param layer {HistoricMapLayer|GeoJsonLayer}
 * @param map {maplibre-gl.Map}
 * @return {{coordinates: *, id: *, isVisible: *, opacity: *, properties: *}}
 */
export const serializeOperationalLayer = (layer, map) => {
    const isVisible = layer.isVisible(map);
    const opacity = layer.getOpacity(map);

    const type = layer.getType();
    const base = {
        id: layer.getId(),
        isVisible,
        opacity,
        properties: layer.getMetadata(),
    };

    if (type === LAYER_TYPES.GEOJSON) {
        const geojsonLayerType = layer.getMetadata(METADATA.type);

        if (geojsonLayerType === LAYER_TYPES.VECTOR_MAP) {
            return Object.assign(base, {
                type: LAYER_TYPES.VECTOR_MAP,
                geometry: layer.getGeometry(),
            });
        }

        // add in geojson specific parts
        return Object.assign(base, {
            geojson: layer.getGeoJsonForPersistence(),
            type: LAYER_TYPES.GEOJSON,
        });
    } else {
        // add in map specific parts
        return Object.assign(base, {
            type: LAYER_TYPES.HISTORIC_MAP,
            geometry: layer.getGeometry(),
        });
    }
};

export const serializeCameraOptions = (map, beautify = false) => {
    const cameraOptions = {
        center: map.getCenter().toArray(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
        zoom: map.getZoom(),
    };

    return beautify ? beautifyMapView(cameraOptions, 5) : cameraOptions;
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
