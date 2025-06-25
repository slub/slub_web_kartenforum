/**
 * Created by nicolas.looschen@pikobytes.de on 05.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import SettingsProvider, { LANGUAGE_CODE } from "@settings-provider";
import { formatDateLocalized, isValidDate } from "@util/date";
import { isDefined, translate } from "@util/util";

const locale =
    SettingsProvider.getSettings().LANGUAGE_CODE === LANGUAGE_CODE.DE
        ? "de-DE"
        : "en-US";
export const cardinalRules = new Intl.PluralRules(locale);

export const signedNumberFormat = new Intl.NumberFormat(locale, {
    signDisplay: "exceptZero",
});

export const shortDateTimeFormat = new Intl.DateTimeFormat(locale, {
    // Time formatting options
    hour: "2-digit", // Ensures two-digit hour
    minute: "2-digit", // Ensures two-digit minute
    hour12: false, // Use 24-hour format

    // Date formatting options
    day: "2-digit", // Two-digit day
    month: "2-digit", // Two-digit month
    year: "numeric", // Full 4-digit year
});

// Custom formatting function to add "Uhr" or "o'clock"
export function formatShortDateTime(date, language = "de") {
    // Get the base formatted parts
    const parts = shortDateTimeFormat.formatToParts(date);

    // Extract time and date components
    const timeParts = {
        hour: parts.find((p) => p.type === "hour").value,
        minute: parts.find((p) => p.type === "minute").value,
        day: parts.find((p) => p.type === "day").value,
        month: parts.find((p) => p.type === "month").value,
        year: parts.find((p) => p.type === "year").value,
    };

    // Format based on language
    if (language === "de") {
        return `${timeParts.hour}:${timeParts.minute} Uhr ${timeParts.day}.${timeParts.month}.${timeParts.year}`;
    } else {
        return `${timeParts.hour}:${timeParts.minute} o'clock ${timeParts.day}.${timeParts.month}.${timeParts.year}`;
    }
}

export function formatFeatureTime(time) {
    if (!isDefined(time)) {
        return translate("geojson-featureview-no-time");
    }

    const [start, end] = time;

    if (!isValidDate(start) || !isValidDate(end)) {
        return translate("geojson-featureview-invalid-time");
    }

    if (start === end) {
        return formatDateLocalized(start);
    }

    return `${formatDateLocalized(start)} – ${formatDateLocalized(end)}`;
}
