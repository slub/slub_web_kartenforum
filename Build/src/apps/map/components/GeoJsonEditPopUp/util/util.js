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
} from "../../../views/GeoJsonView/settings.js";

import { isDefined } from "../../../../../util/util.js";

export const checkForStylingProperty = (propertyKey, geometryType) => {
    return (
        stylingProperties.includes(propertyKey) &&
        styleFieldSettings[propertyKey].geometryTypes.includes(geometryType)
    );
};

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
 * @return {[string, unknown][]}
 */
const filterStylingProperties = (feature) => {
    const geometryType = feature?.geometry?.type;
    const properties = Object.entries(feature.properties);

    const filteredEntries = properties.filter(
        ([k]) => !checkForStylingProperty(k, geometryType)
    );

    return Object.fromEntries(filteredEntries);
};

/**
 * Create an array of entries from the GeoJSON feature properties. Styling properties are filtered out.
 * Predefined entries come first and are sorted.
 *
 * @param feature
 * @return {[string,*][]}
 */
export const filterPropertiesAndSort = (feature) => {
    const nonStylingProperties = filterStylingProperties(feature);

    const defaultSortedPredefinedEntries = predefinedProperties.map((key) => [
        key,
        "",
    ]);

    const mergedSortedPredefinedEntries = defaultSortedPredefinedEntries.map(
        ([key, defaultValue]) => {
            const value = nonStylingProperties[key];
            if (isDefined(value) && value !== "") {
                return [key, value];
            }

            return [key, defaultValue];
        }
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

/*
 * Generate the save handler for update and save changed properties
 */

export const saveFeatureChanges = (map, feature, fieldsRef, handleSave) => {
    const featureId = feature.id;

    const updatedProperties = {};
    fieldsRef.current.forEach(([k, v]) => {
        const isPredefinedKey = predefinedProperties.includes(k);
        const isEmptyValue = v === "";
        const isPredefinedKeyWithEmptyValue = isPredefinedKey && isEmptyValue;
        if (isDefined(k) && k !== "" && !isPredefinedKeyWithEmptyValue) {
            updatedProperties[k] = v;
        }
    });

    const removedPropertyKeys = Object.keys(feature.properties).filter(
        (key) =>
            !ignoredProperties.includes(key) &&
            !stylingProperties.includes(key) &&
            !predefinedProperties.includes(key) &&
            !fieldsRef.current.some(([key]) => key === key)
    );

    const propertiesInGeodiffFormat = Object.entries(updatedProperties).map(
        ([key, value]) => ({ key, value })
    );
    const sourceLayer = map.getSource(feature.source);
    const sourceDiff = {
        update: [
            {
                id: featureId,
                addOrUpdateProperties: propertiesInGeodiffFormat,
                removeProperties: removedPropertyKeys,
            },
        ],
    };
    sourceLayer.updateData(sourceDiff);

    const featureProperties = Object.assign({}, updatedProperties);
    for (const key of removedPropertyKeys) {
        delete featureProperties[key];
    }
    // TODO GEOJSON PORT - add styling props

    handleSave(featureId, featureProperties);
};
