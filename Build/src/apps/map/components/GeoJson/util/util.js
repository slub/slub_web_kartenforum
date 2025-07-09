/**
 * Created by nicolas.looschen@pikobytes.de on 04.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import bbox from "@turf/bbox";

import { stylingProperties } from "../constants.js";

import { isDefined } from "@util/util.js";
import {
    drawModePanelState,
    horizontalLayoutModeState,
    initialGeoJsonDrawState,
    metadataDrawState,
    vectorMapActiveVersionDrawState,
    vectorMapDrawState,
} from "@map/atoms";
import {
    DRAW_MODE_PANEL_STATE,
    HORIZONTAL_LAYOUT_MODE,
} from "@map/layouts/util";

import { METADATA } from "@map/components/CustomLayers";

export const getNonStylingProperties = (feature) => {
    const properties = {};

    for (const key in feature.properties) {
        if (stylingProperties.includes(key)) {
            continue;
        }

        properties[key] = feature.properties[key];
    }

    return properties;
};

const getPropertyKeysToBeRemoved = (oldProperties, newProperties) => {
    const removedPropertyKeys = Object.keys(oldProperties).filter((oldKey) => {
        const isStylingProperty = stylingProperties.includes(oldKey);
        const isAPropertyToBeRemoved =
            !isDefined(newProperties[oldKey]) || newProperties[oldKey] === "";

        return !isStylingProperty && isAPropertyToBeRemoved;
    });

    return removedPropertyKeys;
};

export const buildGeoJSONSourceDiff = ({ oldProperties, newProperties }) => {
    const updatedProperties = {};

    for (const [key, value] of Object.entries(newProperties)) {
        const isEmptyValue = value === "";
        const isEmptyKey = key === "";
        if (!isDefined(key) || isEmptyKey || isEmptyValue) {
            continue;
        }

        updatedProperties[key] = value;
    }

    const removedPropertyKeys = getPropertyKeysToBeRemoved(
        oldProperties,
        newProperties
    );

    const propertiesInGeodiffFormat = Object.entries(updatedProperties).map(
        ([key, value]) => ({ key, value })
    );

    const geoJSONSourceDiff = {
        addOrUpdateProperties: propertiesInGeodiffFormat,
        removeProperties: removedPropertyKeys,
    };

    return geoJSONSourceDiff;
};

export const exitDrawMode = (set) => {
    set(drawModePanelState, DRAW_MODE_PANEL_STATE.NONE);
    set(horizontalLayoutModeState, HORIZONTAL_LAYOUT_MODE.STANDARD);
    set(vectorMapDrawState, null);
    set(vectorMapActiveVersionDrawState, null);
    set(initialGeoJsonDrawState, null);
    set(metadataDrawState, null);
};

export const removeAllFeatureIds = (geoJson) => {
    if (!isDefined(geoJson)) {
        return;
    }

    const clonedGeoJson = structuredClone(geoJson);

    for (const feature of clonedGeoJson.features) {
        delete feature.id;
    }
    return clonedGeoJson;
};

// determines the max feature id
const MAX_VALUE_UINT_16 = 65535;

/**
 * Generates an integer storing feature index in the first 2 bytes and version in the following 2 bytes
 *
 * Background: feature.id must be integer or string that is castable to integer
 * see: https://github.com/maplibre/maplibre-gl-js/discussions/3134
 * see: https://maplibre.org/maplibre-style-spec/expressions/#feature-state
 *
 * @param {number} idx
 * @param {number} version
 */
const generateFeatureID = (idx, version) => {
    if (!isDefined(MAX_VALUE_UINT_16)) {
        throw new Error(
            "Cannot generate feature id. MAX_VALUE_UINT_16 is not specified"
        );
    }

    if (!isDefined(idx) || !isDefined(version)) {
        throw new Error(
            "Cannot generate feature id. Version or index is missing."
        );
    }

    if (!Number.isInteger(idx) || !Number.isInteger(version)) {
        throw new Error(
            "Cannot generate feature id. Version or index is not of type number"
        );
    }

    if (idx > MAX_VALUE_UINT_16 || version > MAX_VALUE_UINT_16) {
        throw new Error(
            `Cannot generate feature id. Version or index is > ${MAX_VALUE_UINT_16}`
        );
    }

    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer);
    dataView.setUint16(0, idx);
    dataView.setUint16(2, version);

    const id = dataView.getUint32(0);
    return id;
};

/**
 * Generates stable ids for persisting vector maps in the database.
 *
 * @param {*} geoJson
 * @returns {*} geoJson with stable ids
 */
export const generateStableIdsForNewGeojson = (geoJson) => {
    const clonedGeoJson = structuredClone(geoJson);

    for (const [idx, feature] of clonedGeoJson.features.entries()) {
        feature.id = generateFeatureID(idx + 1, 0);
    }

    return clonedGeoJson;
};

/**
 * Generates stable ids for persisting vector maps in the database.
 *
 * @param {[]} newFeatureIds
 * @param {*} geoJson
 * @param {number} newVersion
 * @returns {*} geoJson with stable ids
 */
export const generateStableIdsForUpdatedGeojson = (
    initialGeoJson,
    newGeoJson,
    newVersion
) => {
    const clonedGeoJson = structuredClone(newGeoJson);

    // geoJsonChangeTrackingState could be used here as well
    // but w/o unit tests it might be too risky if bugs are introduced there...
    const newFeatureIds = new Set();
    for (const newFeature of newGeoJson.features) {
        const featureExists = initialGeoJson.features.find(
            (initialFeature) => initialFeature.id === newFeature.id
        );

        if (!featureExists) {
            newFeatureIds.add(newFeature.id);
        }
    }

    if (newFeatureIds.size === 0) {
        return clonedGeoJson;
    }

    const features = clonedGeoJson.features.map((feature, idx) => {
        const isNewFeature = newFeatureIds.has(feature.id);
        if (!isNewFeature) {
            return feature;
        }

        return {
            ...feature,
            id: generateFeatureID(idx + 1, newVersion),
        };
    });

    return {
        ...clonedGeoJson,
        features,
    };
};

export const handleErrorResponse = (error, notifyError) => {
    if (error.response) {
        if (error.response.status === 401) {
            notifyError("common-errors-http-401");
            return;
        }

        if (error.response.status === 403) {
            notifyError("common-errors-http-403");

            return;
        }

        if (error.response.status === 409) {
            notifyError("common-errors-http-409");
            return;
        }

        if (error.response.status === 422) {
            notifyError("geojson-draw-error-invalid-input");
            return;
        }
    }

    notifyError("common-errors-unexpected");
    console.error(error);
    return;
};

export const handleErrorResponseExternalVectorMap = (error, notifyError) => {
    if (error.response) {
        if (error.response.status === 401) {
            notifyError("common-errors-http-401");
            return;
        }

        if (error.response.status === 403) {
            notifyError("common-errors-http-403");

            return;
        }

        // e.g., if the geojson url is not reachable
        if (error.response.status === 422) {
            notifyError("geojson-external-vector-map-error-invalid-input");

            return;
        }
    }

    notifyError("common-errors-unexpected");
    console.error(error);
    return;
};

export const updateExternalVectorMapLayerMetadata = (layer, metadata) => {
    if (!isDefined(layer) || !isDefined(metadata)) {
        console.error(
            "Cannot update layer's metadata. Either of the two are not defined."
        );
        return;
    }

    for (const [metadataKey, value] of Object.entries(metadata)) {
        layer.updateMetadata(metadataKey, value);
    }

    // useZoomToExtent hook relies on metadata bounds
    const geoJson = layer.getGeoJson();
    layer.updateMetadata(METADATA.bounds, bbox(geoJson));
};
