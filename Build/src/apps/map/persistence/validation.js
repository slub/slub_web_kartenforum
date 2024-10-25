/**
 * Created by nicolas.looschen@pikobytes.de on 21.04.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { toLonLat } from "ol/proj";

import { MAP_PROJECTION } from "@map/components/MapSearch/MapSearch.jsx";

/**
 * Check if an array represents a three dimensional point
 * @param el
 * @return {boolean}
 */
export const is3dArray = (el) => {
    return el !== undefined && Array.isArray(el) && el.length === 3;
};

/**
 * Check if an element is a valid 3d Point
 * @param el
 * @returns {boolean}
 */
export const is3dPoint = (el) => {
    if (isObject(el)) {
        const { x, y, z } = el;

        return !isNaN(x) && !isNaN(y) && !isNaN(z);
    } else {
        return false;
    }
};

/**
 * Check if an element is an object
 * @param el
 * @returns {boolean}
 */
const isObject = (el) => {
    return typeof el === "object" && !Array.isArray(el) && el !== null;
};

/**
 * Check if an element is a string
 * @param el
 * @returns {boolean}
 */
const isString = (el) => {
    return typeof el === "string" || el instanceof String;
};

/**
 * Checks if an input is a valid coordinate
 * @param coordinate
 * @returns {boolean}
 */
export const isValidCoordinate = (coordinate) => {
    if (coordinate === undefined || null) {
        return false;
    }

    // check if the coordinate is an array and contains at least 2 coordinates
    if (!Array.isArray(coordinate) || coordinate.length < 2) {
        return false;
    }

    const [lon, lat, ...rest] = coordinate;

    // check if the coordinates are numbers
    if (isNaN(lon) || isNaN(lat)) {
        return false;
    }

    // check if the other supplied parts are numbers
    if (rest.some((c) => isNaN(c))) {
        return false;
    }

    // if the values are not given as lat/lon check if they can be interpreted as web mercator coordinates
    if (!isValidLonLat(lon, lat)) {
        const [newLon, newLat] = toLonLat([lon, lat], MAP_PROJECTION);
        return isValidLonLat(newLon, newLat);
    }

    return true;
};

/**
 * Check if lon and lat are within the bounds
 * @param lon
 * @param lat
 * @returns {boolean}
 */
export const isValidLonLat = (lon, lat) => {
    return lon <= 180 && lon >= -180 && lat <= 90 && lat >= -90;
};

/**
 * Validate a persistence object
 * @param persistenceObject
 * @returns {false|boolean}
 */
export const validatePersistenceObject = (persistenceObject) => {
    const { activeBasemapId, is3dEnabled, oid, operationalLayers, mapView } =
        persistenceObject;

    let result = true;

    // validate basemap => either undefined or string
    result &&= activeBasemapId === undefined || isString(activeBasemapId);

    // validate is3dEnabled
    result &&= is3dEnabled === undefined || typeof is3dEnabled === "boolean";

    // validate oid
    result &&= oid === undefined || isString(oid) || Array.isArray(oid);

    // validate operational Layers
    result &&=
        operationalLayers === undefined || Array.isArray(operationalLayers);

    // validate mapView
    result &&= mapView === undefined || validateMapView(mapView, is3dEnabled);

    return result;
};

/**
 * Validate a mapView
 * @param mapView
 * @param is3d
 * @returns {false}
 */
export const validateMapView = (mapView) => {
    let result;

    const { bearing, center, pitch, zoom } = mapView;

    // validate center
    result = center === undefined || isValidCoordinate(center);

    // validate resolution
    result &&= pitch === undefined || (!isNaN(pitch) && pitch >= 0);

    // validate rotation
    result &&= bearing === undefined || !isNaN(bearing);

    // validate zoom
    result &&= zoom === undefined || !isNaN(zoom);

    return result;
};
