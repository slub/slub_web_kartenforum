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
} from "../settings";

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

/**
 * Return transform settings for the DialogEditFeature
 * @param windowSize
 * @param elementsScreenSize
 * @return {{bottomOffset: number, x: number, leftOffset: *, y: number}}
 */
export const getTransformSettings = (windowSize, elementsScreenSize) => {
    const { layermanagement, padding, spatialtemporalsearch } =
        elementsScreenSize;
    const [width, height] = windowSize;

    // conceptual visualization
    // Page
    //  |----------------------|
    // |PPPPPPPPPPPPPPPPPPPPPPP|
    // |PSSSPPPPPPPPPPPPPPPLLLP|
    // |PSSSMMMMMMMMMMMMMMPLLLP|
    // |PSSSMMMMMMMMMMMMMMPLLLP|
    // |PSSSMMMMMMMMMMMMMMPLLLP|
    // |PSSSMMMMMMMMMMMMMMPLLLP|
    // |PSSSMMMMMMMMMMMMMMPLLLP|
    // |PPPPPPPPPPPPPPPPPPPPPPP|
    // |-----------------------|
    // => need to calculate coordinates for the area marked with "M", where bottom left is 0,0
    // => It should be allowed for the dialog to be moved within the area marked with M, but nowhere else
    // => Use css transform, where the area of the dialog has to be included in the calculations
    // => Button on the header is starting point of the movements (include additional offset into calculations)

    // constants for the dialogEdit Feature
    const dialogEditFeatureHeight = 475;
    const dialogEditFeaturePadding = 15;
    const dialogEditFeatureDragButtonHeight = 10;
    const dialogEditFeatureWidth = 392;
    const dialogEditFeatureDragButtonWidth = 25;

    // constants for the footer
    const footerHeight = 40;

    // calculate max X transformation from the supplied values
    const maxXTransform =
        width -
        (layermanagement.width +
            spatialtemporalsearch.width +
            2 * padding.width +
            dialogEditFeatureWidth +
            12);

    // calculate max Y transformation from supplied values
    const maxYTransform = layermanagement.height - dialogEditFeatureHeight;

    // calculate the left offset of the coordinate system => in order to transform event coordinates to the correct coordinate system
    const leftOffset =
        layermanagement.width +
        padding.width +
        dialogEditFeaturePadding +
        0.5 * dialogEditFeatureDragButtonWidth;

    // calculate the bottom offset of the coordinate system => in order to transform event coordinates to the correct coordinate system
    const bottomOffset =
        height -
        (footerHeight +
            padding.height +
            (dialogEditFeatureHeight -
                dialogEditFeaturePadding -
                dialogEditFeatureDragButtonHeight));

    return {
        x: maxXTransform,
        y: maxYTransform,
        leftOffset,
        bottomOffset,
    };
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

export const getNonUniqueRows = (rows) => {
    const indicesPerKey = {};

    rows.forEach((row, index) => {
        const key = row[0];

        if (indicesPerKey[key] !== undefined) {
            indicesPerKey[key].push(index);
        } else {
            indicesPerKey[key] = [index];
        }
    });

    return Object.values(indicesPerKey)
        .filter((indices) => indices.length > 1)
        .flat();
};
