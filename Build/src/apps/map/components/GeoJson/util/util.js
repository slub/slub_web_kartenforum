/**
 * Created by nicolas.looschen@pikobytes.de on 04.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
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
