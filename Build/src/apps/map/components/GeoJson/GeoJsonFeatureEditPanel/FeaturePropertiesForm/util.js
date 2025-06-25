/*
 * Created by tom.schulze@pikobytes.de on 23.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined } from "@util/util";
import { parseColorStringToHexWithLegacy } from "../../util/colorUtil";
import {
    DEFAULT_STYLE_VALUES,
    GEOJSON_LAYER_TYPES,
} from "@map/components/CustomLayers/GeoJsonLayer/VkfMapInteractionStrategy/constants";
import {
    ignoredProperties,
    predefinedProperties,
    styleFieldSettings,
    stylingProperties,
} from "../../constants";
import { formatDateLocalized, parseDateLocalized } from "@util/date.js";

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
 * Create an array of records from the GeoJSON feature properties used for map styles.
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

    const styleEntries = defaultStyleEntries.map(mergeWith(styleProperties));

    return styleEntries.map(([key, value]) => ({ name: key, value }));
};

// maps [number,number] to localized date format for display in form fields
const propertiesTimePeriodToForm = (timePeriod) => {
    const timeStart = formatDateLocalized(timePeriod[0]) ?? "";
    const timeEnd = formatDateLocalized(timePeriod[1]) ?? "";

    return { timeStart, timeEnd };
};

// maps localized [string,string] to [number,number]
const formTimePeriodToProperties = (start, end) => {
    if (start === "" || end === "") {
        return [];
    }

    const parsedStartDate = parseDateLocalized(start).valueOf();
    const parsedEndDate = parseDateLocalized(end).valueOf();

    if (Number.isNaN(parsedStartDate) || Number.isNaN(parsedEndDate)) {
        return [];
    }

    return [parsedStartDate, parsedEndDate];
};

/**
 * Maps feature properties to form properties
 *
 * @param feature
 * @return {Object.<string, any>}
 */
export const featurePropertiesToFormProperties = (feature) => {
    const nonStylingProperties = filterStylingProperties(feature);
    const defaultPredefinedEntries = predefinedProperties.map((key) => [
        key,
        "",
    ]);
    const mergedPredefinedEntries = defaultPredefinedEntries.map(
        mergeWith(nonStylingProperties)
    );

    const { time, ...predefinedProps } = Object.fromEntries(
        mergedPredefinedEntries
    );
    const { timeStart, timeEnd } = propertiesTimePeriodToForm(time);

    const customEntries = Object.entries(nonStylingProperties)
        .filter(filterPredefinedEntries)
        .filter(filterIgnoredEntries);
    const customProps = customEntries.map(([key, value]) => ({
        name: key,
        value,
    }));

    const styleProps = extractStyleProperties(feature).map(
        ({ name, value }) => {
            const { inputProps } = styleFieldSettings[name];
            const coercedValue = validateStyleValue(value, inputProps);
            return {
                name,
                value: coercedValue,
            };
        }
    );

    return {
        timeStart,
        timeEnd,
        ...predefinedProps,
        customProps,
        styleProps,
    };
};

/**
 * Maps form properties to feature properties
 *
 * @param formData
 * @return {Object.<string, any>}
 */
export const formPropertiesToFeatureProperties = (formData) => {
    const {
        img_link,
        title,
        description,
        timeStart,
        timeEnd,
        customProps,
        styleProps,
    } = formData;

    const time = formTimePeriodToProperties(timeStart, timeEnd);

    const featureCustomProps = Object.fromEntries(
        customProps
            .filter((el) => el.name !== "" || el.value !== "")
            .map((el) => [el.name, el.value])
    );
    const featureStyleProps = Object.fromEntries(
        styleProps.map((el) => {
            const { inputProps } = styleFieldSettings[el.name];
            const coercedValue = validateStyleValue(el.value, inputProps);
            return [el.name, coercedValue];
        })
    );

    return {
        ...(time.length > 0 && { time }),
        title,
        description,
        img_link,
        ...featureCustomProps,
        ...featureStyleProps,
    };
};

export const validateStyleValue = (inputValue, inputProps) => {
    const { type, min, max } = inputProps;
    let newValue = inputValue;

    if (type === "number") {
        newValue = Number.isNaN(Number.parseFloat(newValue))
            ? 1
            : parseFloat(newValue);
        newValue = isDefined(min) ? Math.max(min, newValue) : newValue;
        newValue = isDefined(max) ? Math.min(max, newValue) : newValue;
    } else if (type === "color") {
        try {
            newValue = parseColorStringToHexWithLegacy(newValue);
        } catch {
            newValue = DEFAULT_STYLE_VALUES[GEOJSON_LAYER_TYPES.SYMBOL].COLOR;
        }
    }
    return newValue;
};

export const isValidCustomPropertyFieldName = (value, fields, index) => {
    const fieldValue = fields.customProps[index].value;
    const fieldName = value;
    const otherCustomFieldNames = fields.customProps
        .filter((_, elIndex) => elIndex !== index)
        .filter((el) => el.name !== "")
        .map((el) => el.name.toLowerCase());

    const invalidFieldNames = [
        ...predefinedProperties,
        ...otherCustomFieldNames,
    ];

    if (fieldValue.trim().length > 0 && fieldName.trim() === "") {
        return false;
    }

    if (invalidFieldNames.includes(fieldName.toLowerCase())) {
        return false;
    }

    return true;
};

export const isValidCustomPropertyFieldValue = (value, fields, index) => {
    const fieldName = fields.customProps[index].name;

    if (fieldName.trim().length > 0 && value.trim() === "") {
        return false;
    }

    return true;
};
