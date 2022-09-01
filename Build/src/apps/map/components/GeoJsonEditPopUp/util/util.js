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

export const checkForStylingProperty = (propertyKey, geometryType) => {
    return (
        stylingProperties.includes(propertyKey) &&
        styleFieldSettings[propertyKey].geometryTypes.includes(geometryType)
    );
};

export const checkForPredefinedProperty = (propertyKey) => {
    return predefinedProperties.includes(propertyKey);
};

export const convertIntToHex = (int) => {
    return Number(int.toFixed(0)).toString(16).padStart(2, "0");
};

/**
 * Filter out styling properties
 * @param feature
 * @return {[string, unknown][]}
 */
export const filterStylingProperties = (feature) => {
    const geometryType = feature.getGeometry().getType();
    const properties = Object.entries(feature.getProperties());

    return properties.filter(
        ([k]) => !checkForStylingProperty(k, geometryType)
    );
};

/**
 * Filter out styling properties and ignored properties
 * @param feature
 * @return {[string,*][]}
 */
export const filterCustomProperties = (feature) => {
    const filteredStylingProperties = filterStylingProperties(feature);

    return filteredStylingProperties
        .filter(([k]) => !ignoredProperties.includes(k))
        .filter(([k]) => !predefinedProperties.includes(k));
};

export const parseRgbStringToHex = (rgbString) => {
    // rgb(r,g,b);
    const values = rgbString
        .split("(")[1]
        .split(")")[0]
        .split(",")
        .map((v) => parseInt(v, 10));
    return `#${values.map(convertIntToHex).join("")}FF`;
};

export const parseRgbaStringToHex = (rgbaString) => {
    // rgba(r,g,b,a);
    const values = rgbaString.split("(")[1].split(")")[0].split(",");

    return `#${values
        .slice(0, 3)
        .map((v) => parseInt(v, 10))
        .map(convertIntToHex)
        .join("")}${convertIntToHex(parseFloat(values[3]) * 255)}`;
};

export const parseColorStringToHex = (colorString) => {
    const trimmed = colorString.trim();

    if (trimmed.startsWith("rgba")) {
        return parseRgbaStringToHex(trimmed);
    } else if (trimmed.startsWith("rgb")) {
        return parseRgbStringToHex(trimmed);
    } else if (trimmed.startsWith("#")) {
        // hex shortcut => expand
        if (colorString.length === 4) {
            return "#" + colorString.slice(1, 3).map((x) => `${x}${x}`) + "FF"; // add alpha;
        } else if (colorString.length === 7) {
            return colorString + "FF";
        } else if (colorString.length === 9) {
            return colorString;
        }
    }

    throw new Error("Unknown color format");
};

export const splitAlphaChannel = (hexString) => {
    // #CCCCCC | split here | OO
    const color = hexString.slice(0, 7);
    const opacity = hexString.slice(7);

    return [color, parseFloat((parseInt(opacity, 16) / 255).toFixed(2))];
};

/**
 *
 * @param oldColor
 * @param newAlpha
 * @return {`${*}${string}`}
 */
export const updateAlphaChannel = (oldColor, newAlpha) => {
    return `${oldColor.slice(0, 7)}${convertIntToHex(newAlpha * 255)}`;
};

/**
 * Updates the color part of a hex color, retains the alpha channel
 * @param oldColor
 * @param newColorChannels
 * @return {`${string}${*}`}
 */
export const updateColorChannels = (oldColor, newColorChannels) => {
    // if there are alpha channels present in the new color string, just return the whole thing, else add in previous alpha
    return newColorChannels.length === 9
        ? newColorChannels
        : `${newColorChannels}${oldColor.slice(7)}`;
};

/**
 * Generates a change handler for the fill property
 * @param updateFn
 * @return {(function(*, *): void)|*}
 */
export const generateFillChangeHandler =
    (updateFn) => (feature, updatedValue) => {
        const newStyle = feature.getStyle().clone();
        const fill = newStyle.getFill();
        const oldColor = fill.getColor();
        const newColorWithAlpha = updateFn(oldColor, updatedValue);

        const newFill = fill.clone();
        newFill.setColor(newColorWithAlpha);

        newStyle.setFill(newFill);
        feature.setStyle(newStyle);
    };

/**
 * Generates a change handler for the stroke property
 * @param updateFn
 * @return {(function(*, *): void)|*}
 */
export const generateStrokeChangeHandler =
    (updateFn) => (feature, updatedValue) => {
        const newStyle = feature.getStyle().clone();
        const stroke = newStyle.getStroke();
        const oldColor = stroke.getColor();
        const newColorWithAlpha = updateFn(oldColor, updatedValue);

        const newStroke = stroke.clone();
        newStroke.setColor(newColorWithAlpha);

        newStyle.setStroke(newStroke);
        feature.setStyle(newStyle);
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
    const Properties = Object.keys(feature.values_)
        .filter((property) => !filterList.includes(property))
        .reduce((object, property) => {
            return {
                ...object,
                [property]: feature.values_[property],
            };
        }, {});

    return Properties;
};

/*
 * Generate the save handler for update and save changed properties
 */

export const saveFeatureChanges = (feature, fieldsRef) => {
    const oldProperties = feature.getProperties();
    const updatedProperties = {};

    fieldsRef.current.forEach(([k, v]) => {
        if (k !== undefined && k !== "") {
            updatedProperties[k] = v;
        }
    });

    Object.entries(oldProperties)
        .filter(
            (entry) =>
                ignoredProperties.includes(entry[0]) ||
                predefinedProperties.includes(entry[0])
        )
        .forEach(([k, v]) => {
            updatedProperties[k] = v;
        });

    Object.keys(oldProperties).forEach((propertyKey) =>
        feature.unset(propertyKey)
    );

    feature.setProperties(Object.assign({}, updatedProperties));
};
