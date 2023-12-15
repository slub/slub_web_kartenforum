/**
 * Created by nicolas.looschen@pikobytes.de on 05.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { styleFieldSettings } from "../../../views/GeoJsonView/settings.js";
import { parseColorStringToHex } from "./util";

function isPrimitiveString(value) {
    return typeof value === "string" && value.constructor === String;
}

/**
 * Apply styling represented in geojson (as used by geojson.io) to a supplied feature
 * @param feature
 */
export const parseGeojsonStyles = (feature) => {
    const geometryType = feature.getGeometry().getType();
    const properties = feature.getProperties();
    const propertyKeys = Object.keys(properties);

    Object.keys(styleFieldSettings).forEach((setting) => {
        const { changeHandler, geometryTypes, type } =
            styleFieldSettings[setting];

        if (
            propertyKeys.includes(setting) &&
            geometryTypes.includes(geometryType)
        ) {
            changeHandler(
                feature,
                type === "color"
                    ? parseColorStringToHex(properties[setting])
                    : isPrimitiveString(properties[setting])
                    ? properties[setting].toLowerCase()
                    : properties[setting]
            );

            // remove property from feature, because it is stored in the styling information
            feature.unset(setting);
        }
    });
};

/**
 * Parses a date to a localized string, inferring the locale from the url path
 * @param date
 * @return {string}
 */
export const parseDate = (date) => {
    // format time based on localization
    const formattedDate = new Date(date);
    const isEnglish = window.location.pathname.includes("/en/");
    const options = { year: "numeric", month: "long", day: "numeric" };
    return formattedDate.toLocaleString(isEnglish ? "en-US" : "de-DE", options);
};
