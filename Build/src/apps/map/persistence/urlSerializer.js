/**
 * Created by nicolas.looschen@pikobytes.de on 17.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { URL_VIEW_MODES } from "./urlParser";
import { LAYER_TYPES } from "../components/CustomLayers/LayerTypes";
import SettingsProvider from "../../../SettingsProvider.js";

/**
 * Convert a mapview representation to url parameters
 * @param mapView
 * @param is3dEnabled
 * @return {any}
 */
export const mapViewToUrlParams = (mapView, is3dEnabled) => {
    if (is3dEnabled) {
        const { direction, position, right, up } = mapView;

        // only assign defined properties to the resulting mapview item
        return Object.assign(
            {},
            isPoint(position) ? { p: pointTo3dArray(position) } : null,
            isPoint(direction) ? { d: pointTo3dArray(direction) } : null,
            isPoint(up) ? { u: pointTo3dArray(up) } : null,
            isPoint(right) ? { ri: pointTo3dArray(right) } : null
        );
    } else {
        const { center, resolution, rotation, zoom } = mapView;

        // only assign defined properties to the resulting mapview item
        return Object.assign(
            {},
            center === undefined ? null : { c: center },
            resolution === undefined ? null : { re: resolution },
            rotation === undefined ? null : { r: rotation },
            zoom === undefined ? null : { z: zoom }
        );
    }
};

/**
 * Check if an element is a 3d point
 * @param el
 * @return {boolean}
 */
const isPoint = (el) => {
    return (
        el !== undefined &&
        el.x !== undefined &&
        el.y !== undefined &&
        el.z !== undefined
    );
};

/**
 * Converts a 3 dimensional point to an array
 * @param point
 * @return {[undefined,undefined,*]}
 */
const pointTo3dArray = (point) => {
    return [point.x, point.y, point.z];
};

/**
 * serializes the basemap id to an url parameter
 * @param basemapId
 * @return {{b}}
 */
export const serializeBasemapId = (basemapId) => {
    const defaultBasemaps = SettingsProvider.getBaseMaps();
    const isDefaultBasemap =
        defaultBasemaps.filter((basemap) => basemap.id === basemapId).length >
        0;

    return isDefaultBasemap ? { b: basemapId } : {};
};

/**
 * serializes a selected feature state to an url parameter
 * @param selectedFeatures
 * @return {{oid: *}}
 */
export const serializeSelectedFeatures = (selectedFeatures) => {
    return {
        map_id: selectedFeatures
            .filter(({ type }) => type === LAYER_TYPES.HISTORIC_MAP)
            .map(({ feature }) => feature.getId()),
    };
};

/**
 * serialize the view mode to an url paramter
 * @param is3dActive
 * @return {{v: (number)}}
 */
export const serializeViewMode = (is3dActive) => {
    return { v: is3dActive ? URL_VIEW_MODES["3D"] : URL_VIEW_MODES["2D"] };
};
