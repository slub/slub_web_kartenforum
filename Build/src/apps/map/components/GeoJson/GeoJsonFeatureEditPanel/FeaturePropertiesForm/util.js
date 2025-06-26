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
    defaultStylesForGeometry,
    predefinedProperties,
    styleFieldSettings,
} from "../../constants";
import { formatDateLocalized, parseDateLocalized } from "@util/date.js";
import { getNonStylingProperties } from "../../util/util";

// maps [number,number] to localized date format for display in form fields
const propertiesTimePeriodToForm = (timePeriod) => {
    if (!Array.isArray(timePeriod)) {
        return {
            timeStart: "",
            timeEnd: "",
        };
    }

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

const extractValidStyleProperties = (feature) => {
    const geometryType = feature?.geometry?.type;

    const defaultStyles = defaultStylesForGeometry[geometryType];

    const validStyleProperties = [];

    for (const key in defaultStyles) {
        const value = feature.properties[key] ?? defaultStyles[key];
        const coercedValue = validateStyleValue(key, value);
        validStyleProperties.push({
            name: key,
            value: coercedValue,
        });
    }

    return validStyleProperties;
};

const extractValidPredefinedProperties = (feature) => {
    const predefinedProps = {};

    for (const key of predefinedProperties) {
        const value = feature.properties[key] ?? "";

        predefinedProps[key] = value;
    }

    return predefinedProps;
};

const extractValidCustomProperties = (feature) => {
    const nonStylingProperties = getNonStylingProperties(feature);

    const customProps = [];
    for (const key in nonStylingProperties) {
        const value = nonStylingProperties[key];
        if (predefinedProperties.includes(key)) {
            continue;
        }

        if (typeof value === "object") {
            continue;
        }

        customProps.push({ name: key, value: `${value}` });
    }

    return customProps;
};

export const featurePropertiesToFormProperties = (feature) => {
    const predefinedProps = extractValidPredefinedProperties(feature);

    const { time, ...otherPredefinedProps } = predefinedProps;
    const { timeStart, timeEnd } = propertiesTimePeriodToForm(time);

    const customProps = extractValidCustomProperties(feature);
    const styleProps = extractValidStyleProperties(feature);

    return {
        timeStart,
        timeEnd,
        ...otherPredefinedProps,
        customProps,
        styleProps,
    };
};

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
            const coercedValue = validateStyleValue(el.name, el.value);
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

export const validateStyleValue = (key, value) => {
    const { type, min, max } = styleFieldSettings[key];
    let newValue = value;

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
