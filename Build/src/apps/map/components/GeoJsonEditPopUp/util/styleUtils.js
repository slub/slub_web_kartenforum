/*
 * Created by tom.schulze@pikobytes.de on 17.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

export const convertIntToHex = (int) => {
    return Number(int.toFixed(0)).toString(16).padStart(2, "0");
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
