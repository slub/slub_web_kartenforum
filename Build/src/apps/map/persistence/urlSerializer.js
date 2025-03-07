/**
 * Created by nicolas.looschen@pikobytes.de on 17.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { URL_VIEW_MODES } from "./urlParser";
import { LAYER_TYPES, METADATA } from "@map/components/CustomLayers";
import SettingsProvider from "@settings-provider";

/**
 * Convert a mapview representation to url parameters
 * @param mapView
 * @param is3dEnabled
 * @return {any}
 */
export const cameraToUrlParams = (mapView) => {
    const { center, bearing, pitch, zoom } = mapView;

    // only assign defined properties to the resulting mapview item
    return Object.assign(
        {},
        center === undefined ? null : { c: center },
        bearing === undefined ? null : { be: bearing },
        pitch === undefined ? null : { p: pitch },
        zoom === undefined ? null : { z: zoom }
    );
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
 * Serializes a selected layer state to an url parameter
 * @param {[object]} selectedLayers an array of HistoricMapLayer instances
 * @return {{oid: *}}
 */
export const serializeSelectedLayers = (selectedLayers) => {
    return {
        map_id: selectedLayers
            .filter(
                (layer) =>
                    layer.getType() === LAYER_TYPES.HISTORIC_MAP ||
                    layer.getMetadata(METADATA.vectorMapId)
            )
            .map((layer) => layer.getId()),
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

/**
 * Serialze the feature identifier for the feature permalink
 * @param {{featureId: number, sourceId: string}} featureIdentifier
 * @returns {{fid: number, foid: string}}
 */
export const serializeFeatureIdentifier = ({ featureId, sourceId }) => ({
    fid: featureId,
    foid: sourceId,
});
