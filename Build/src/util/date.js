/*
 * Created by tom.schulze@pikobytes.de on 04.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */
import { utc } from "@date-fns/utc";
import {
    parse,
    format,
    parseISO,
    isValid,
    getUnixTime,
    startOfDay,
    formatISO,
} from "date-fns";
import SettingsProvider, { LANGUAGE_CODE } from "@settings-provider";
import { isDefined, isString } from "./util";

/**
 * @typedef LocalizedDateFormats
 * The expected date formats for date localization e.g., when parsing date strings from input fields.
 */
const dateFormats = {
    en: "MM/dd/yyyy",
    de: "dd.MM.yyyy",
};

/**
 * Formats a date according to the currently active TYPO3 language settings in UTC.
 * @param {Date|number|string} date A date that can be parsed by new Date(date)
 * @returns string The formatted date string
 */
export function formatDateLocalized(date) {
    const currentLanguageCode = SettingsProvider.getSettings().LANGUAGE_CODE;

    const parsedDate = new Date(date);

    if (!isValidDate(parsedDate)) {
        return date;
    }

    if (!Object.hasOwn(dateFormats, currentLanguageCode)) {
        return format(parsedDate, dateFormats[LANGUAGE_CODE.EN], {
            in: utc,
        });
    }

    return format(parsedDate, dateFormats[currentLanguageCode], {
        in: utc,
    });
}

/**
 * Parses a date string according to the currently active TYPO3 language settings in UTC.
 * @param {string} dateString A date string representing one of {@link LocalizedDateFormats} (depending on TYPO3 language setting).
 * @returns {Date} The Date object
 */
export function parseDateLocalized(date) {
    const currentLanguageCode = SettingsProvider.getSettings().LANGUAGE_CODE;
    const referenceDate = new Date();

    if (!Object.hasOwn(dateFormats, currentLanguageCode)) {
        return parse(date, dateFormats[LANGUAGE_CODE.EN], referenceDate, {
            in: utc,
        });
    }

    return parse(date, dateFormats[currentLanguageCode], referenceDate, {
        in: utc,
    });
}

/**
 * Parses a value representing a date to a ISO date string in UTC. Returns empty string for invalid dates.
 * @param {unknown} date The date as a value convertible to a Date object or a date object itself.
 * @returns {string} The ISO string or empty string if date represents an invalid date.
 */
export function formatDateIso(date) {
    let formattedDate = "";

    try {
        formattedDate = formatISO(date, { in: utc });
    } catch (error) {
        formattedDate = "";
    }

    return formattedDate;
}

/**
 * Formats an ISO 8601 string to a date object in UTC.
 * @param {string} dateString The ISO date string to be parsed
 * @returns {Date}
 */
export function parseDateIso(dateString) {
    if (!isDefined(dateString) || !isString(dateString)) {
        return new Date("invalid");
    }

    return parseISO(dateString, { in: utc });
}

/**
 * Checks if date is representing a valid date.
 
 * @param {unknown} date The date as a value convertible to a Date object or a date object itself.
 * @returns {boolean}
 */
export function isValidDate(date) {
    return isValid(date);
}

/**
 * Resets a date to the start of the day in UTC.
 * @param {Date} date A Date instance
 * @returns {Date}
 */
export function normalizeDate(date) {
    return startOfDay(date, { in: utc });
}

export function getUnixSeconds(date) {
    if (!isDefined(date)) {
        return Number.NaN;
    }

    return getUnixTime(date);
}
