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

import { isDefined } from "../../../../../util/util.js";

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

export const buildGeoJSONSourceDiff = ({
    feature,
    propertyFields,
    styleFields,
}) => {
    const updatedProperties = {};
    propertyFields.forEach(([k, v]) => {
        const isPredefinedKey = predefinedProperties.includes(k);
        const isEmptyValue = v === "";
        const isPredefinedKeyWithEmptyValue = isPredefinedKey && isEmptyValue;
        if (isDefined(k) && k !== "" && !isPredefinedKeyWithEmptyValue) {
            updatedProperties[k] = v;
        }
    });
    styleFields.forEach(([k, v]) => {
        updatedProperties[k] = v;
    });

    const removedPropertyKeys = Object.keys(feature.properties).filter(
        (key) =>
            !ignoredProperties.includes(key) &&
            !stylingProperties.includes(key) &&
            !predefinedProperties.includes(key) &&
            !propertyFields.some(([customKey]) => customKey === key)
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
