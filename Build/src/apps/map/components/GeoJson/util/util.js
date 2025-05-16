/**
 * Created by nicolas.looschen@pikobytes.de on 04.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import bbox from "@turf/bbox";

import {
    ignoredProperties,
    predefinedProperties,
    stylingProperties,
    styleFieldSettings,
} from "../constants.js";

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

/**
 * A utility function to merge an array of entries with values from an existing Object.
 * To be used as a callback for Object.entries(myObj).map().
 * @param {object} obj
 * @returns {[string, unknown][]}
 */
const mergeWith =
    (obj) =>
    ([key, originalValue]) => {
        const mergedValue = obj[key];
        if (
            Object.hasOwn(obj, key) &&
            isDefined(mergedValue) &&
            mergedValue !== ""
        ) {
            return [key, mergedValue];
        }

        return [key, originalValue];
    };

const getGeometryType = (feature) => {
    return feature?.geometry?.type;
};

const getDeclaredGeometryTypes = () => {
    const geometryTypesFromStylingProperties = Object.values(
        styleFieldSettings
    ).map(({ geometryTypes }) => geometryTypes);

    const types = new Set(geometryTypesFromStylingProperties.flat(2));

    return types;
};

const checkForStylingEntries = (() => {
    const geometryTypes = getDeclaredGeometryTypes();

    const checkForStylingEntriesPerGeometryType = {};
    for (const geometryType of geometryTypes) {
        checkForStylingEntriesPerGeometryType[geometryType] = ([
            propertyKey,
        ]) => {
            return (
                stylingProperties.includes(propertyKey) &&
                styleFieldSettings[propertyKey].geometryTypes.includes(
                    geometryType
                )
            );
        };
    }

    return checkForStylingEntriesPerGeometryType;
})();

const filterPredefinedEntries = ([propertyKey]) =>
    !predefinedProperties.includes(propertyKey);

const filterIgnoredEntries = ([propertyKey]) =>
    !ignoredProperties.includes(propertyKey);

export const convertIntToHex = (int) => {
    return Number(int.toFixed(0)).toString(16).padStart(2, "0");
};

/**
 * Filter out styling properties
 * @param feature
 * @return {object}
 */
const filterStylingProperties = (feature) => {
    const geometryType = getGeometryType(feature);
    const entries = Object.entries(feature.properties);

    const filteredEntries = entries.filter(
        (entry) => !checkForStylingEntries[geometryType](entry)
    );

    return Object.fromEntries(filteredEntries);
};

/**
 * Retain styling properties
 * @param feature
 * @return {object}
 */
const retainStylingProperties = (feature) => {
    const geometryType = getGeometryType(feature);
    const entries = Object.entries(feature.properties);

    const filteredEntries = entries.filter((entry) =>
        checkForStylingEntries[geometryType](entry)
    );

    return Object.fromEntries(filteredEntries);
};

/**
 * Create an array of entries from the GeoJSON feature properties.
 * Only styling properties are included.
 * Default styling properties are merged with feature properties.
 *
 * @param feature
 * @return {[string,*][]}
 */
export const extractStyleProperties = (feature) => {
    const geometryType = getGeometryType(feature);
    const styleProperties = retainStylingProperties(feature);

    const defaultStyleEntries = Object.entries(styleFieldSettings)
        .filter(checkForStylingEntries[geometryType])
        .map(([key, { default: defaultValue }]) => [
            key,
            defaultValue(geometryType),
        ]);

    return defaultStyleEntries.map(mergeWith(styleProperties));
};

/**
 * Create an array of entries from the GeoJSON feature properties.
 * Styling properties are filtered out.
 * Default/Predefined entries are merged with feature properties.
 * Predefined entries come first and are sorted.
 *
 * @param feature
 * @return {[string,*][]}
 */
export const extractAndSortNonStyleProperties = (feature) => {
    const nonStylingProperties = filterStylingProperties(feature);

    const defaultSortedPredefinedEntries = predefinedProperties.map((key) => [
        key,
        "",
    ]);

    const mergedSortedPredefinedEntries = defaultSortedPredefinedEntries.map(
        mergeWith(nonStylingProperties)
    );

    const customEntries = Object.entries(nonStylingProperties)
        .filter(filterPredefinedEntries)
        .filter(filterIgnoredEntries);

    return [...mergedSortedPredefinedEntries, ...customEntries];
};

/*
 * filter and extract the properties of the feature
 */
export const propExtractor = (feature) => {
    const filterList = [
        "marker",
        "stroke",
        "stroke-opacity",
        "stroke-width",
        "fill",
        "fill-opacity",
        "geometry",
    ];

    const properties = Object.keys(feature.properties)
        .filter((property) => !filterList.includes(property))
        .reduce((object, property) => {
            return {
                ...object,
                [property]: feature.properties[property],
            };
        }, {});

    return properties;
};

const getPropertyKeysToBeRemoved = (oldProperties, newProperties) => {
    const removedPropertyKeys = Object.keys(oldProperties).filter((oldKey) => {
        const isIgnoredProperty = ignoredProperties.includes(oldKey);
        const isStylingProperty = stylingProperties.includes(oldKey);
        const isAPropertyToBeRemoved =
            !isDefined(newProperties[oldKey]) || newProperties[oldKey] === "";

        return (
            !isIgnoredProperty && !isStylingProperty && isAPropertyToBeRemoved
        );
    });

    return removedPropertyKeys;
};

export const buildGeoJSONSourceDiff = ({
    oldProperties,
    propertyFields,
    styleFields,
}) => {
    const updatedProperties = {};
    propertyFields.forEach(([key, value]) => {
        const isEmptyValue = value === "";
        const isEmptyKey = key === "";
        if (isDefined(key) && !isEmptyKey && !isEmptyValue) {
            updatedProperties[key] = value;
        }
    });
    styleFields.forEach(([key, value]) => {
        updatedProperties[key] = value;
    });

    const newProperties = Object.fromEntries(propertyFields);
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

export const validatePropertyField = (key, value, existingFields) => {
    const errors = { key: false, value: false };
    const isKeyExists = existingFields.some(
        ([existingKey]) => existingKey.toLowerCase() === key.toLowerCase()
    );
    if (!key.trim() || isKeyExists) {
        errors.key = true;
    }
    if (!value.trim()) errors.value = true;

    return {
        isValid: !errors.key && !errors.value,
        errors,
    };
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
export const processNewGeoJsonForPersistence = (geoJson) => {
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
export const processUpdatedGeoJsonForPersistence = (
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

    // useZoomToExtent hook relies on metadata bounds
    const geoJson = layer.getGeoJson();
    layer.updateMetadata(METADATA.bounds, bbox(geoJson));

    layer.updateMetadata(METADATA.title, metadata[METADATA.title]);
    layer.updateMetadata(METADATA.description, metadata[METADATA.description]);
    layer.updateMetadata(
        METADATA.thumbnailUrl,
        metadata[METADATA.thumbnailUrl]
    );
    layer.updateMetadata(METADATA.timePeriod, metadata[METADATA.timePeriod]);
    layer.updateMetadata(
        METADATA.externalContentUrl,
        metadata[METADATA.externalContentUrl]
    );
};
