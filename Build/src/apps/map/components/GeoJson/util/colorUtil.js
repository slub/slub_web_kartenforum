/*
 * Created by tom.schulze@pikobytes.de on 17.09.24.
 * Code originally created by nicolas.looschen@pikobytes.de.
 * I added the useAlpha flag
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined } from "@util/util";

const DEFAULT_ALPHA = "FF";

export const convertIntToHex = (int) => {
    return Number(int.toFixed(0)).toString(16).padStart(2, "0");
};

export const parseRgbStringToHex = (
    rgbString,
    { useAlpha } = { useAlpha: false }
) => {
    // rgb(r,g,b);
    const values = rgbString
        .split("(")[1]
        .split(")")[0]
        .split(",")
        .map((v) => parseInt(v, 10))
        .map(convertIntToHex)
        .join("");

    return useAlpha ? `#${values}${DEFAULT_ALPHA}` : `#${values}`;
};

export const parseRgbaStringToHex = (
    rgbaString,
    { useAlpha } = { useAlpha: false }
) => {
    // rgba(r,g,b,a);
    const values = rgbaString.split("(")[1].split(")")[0].split(",");

    const rgbHexValues = values
        .slice(0, 3)
        .map((v) => parseInt(v, 10))
        .map(convertIntToHex)
        .join("");

    const alphaValue = convertIntToHex(parseFloat(values[3]) * 255);

    return useAlpha ? `#${rgbHexValues}${alphaValue}` : `#${rgbHexValues}`;
};

export const parseColorStringToHex = (
    colorString,
    { useAlpha } = { useAlpha: false }
) => {
    const trimmed = colorString.trim();

    if (trimmed.startsWith("rgba")) {
        return parseRgbaStringToHex(trimmed, { useAlpha });
    } else if (trimmed.startsWith("rgb")) {
        return parseRgbStringToHex(trimmed, { useAlpha });
    } else if (trimmed.startsWith("#")) {
        // hex shortcut => expand
        if (colorString.length === 4) {
            const expandedString = colorString
                .slice(1, 3)
                .map((x) => `${x}${x}`);

            return useAlpha
                ? `#${expandedString}${DEFAULT_ALPHA}`
                : `#${expandedString}`;
        } else if (colorString.length === 7) {
            return useAlpha ? `${colorString}${DEFAULT_ALPHA}` : colorString;
        } else if (colorString.length === 9) {
            return useAlpha ? colorString : colorString.slice(0, 7);
        }
    }

    throw new Error("Unknown color format");
};

/**
 * Converts legacy color names to maplibre's interpretation of ["to-color", legacyColor].
 *
 * @param {string} legacyColor A color name as used in VKF before the maplibre migration.
 */
const parseLegacyColors = (legacyColor) => {
    const legacyColors = {
        blue: "#0000ff",
        green: "#008000",
        orange: "#ffa500",
        pink: "#ffc0cb",
        yellow: "#ffff00",
    };

    if (!isDefined(legacyColor) && typeof legacyColor !== "string") {
        throw new Error("No input specified");
    }

    const color = legacyColor.trim().toLowerCase();

    if (!Object.hasOwn(legacyColors, color)) {
        throw new Error("No matching legacy color found");
    }

    return legacyColors[color];
};

/**
 * Attempts to parse a color string to a hex value. It tries rgba, rgb, hex shorthand and hex color formats.
 * If none of the listed succeed, it tries to match legacy colors to hex values from a predefined mapping.
 *
 * @param {string} color A color string. Either rgba, rgb, shorthand hex or hex formats or a color name as used before the maplibre migration.
 */
export const parseColorStringToHexWithLegacy = (color) => {
    let parsedColor = color;

    try {
        parsedColor = parseColorStringToHex(color);
    } catch (e) {
        parsedColor = parseLegacyColors(color);
    }

    return parsedColor;
};
