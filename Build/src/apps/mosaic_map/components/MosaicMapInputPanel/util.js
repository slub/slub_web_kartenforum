/*
 * Created by tom.schulze@pikobytes.de on 16.11.26.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */
import { getCurrentYear } from "@util/date";

export const YEAR_MIN = 1;

// an empty year (not entered or cleared) is an open side of the time period
export const isEmptyYear = (year) =>
    year === undefined || year === null || Number.isNaN(year);

/**
 * Checks if the given value is empty or a whole number from YEAR_MIN to the
 * current year.
 * @param {number|null|undefined} year
 * @returns {boolean}
 */
export const isValidYear = (year) =>
    isEmptyYear(year) ||
    (Number.isInteger(year) && year >= YEAR_MIN && year <= getCurrentYear());

/**
 * Checks the rules across start and end year: one side may be empty (open),
 * but not both. If both are set, the start must not be after the end.
 * @param {number|null|undefined} start
 * @param {number|null|undefined} end
 * @returns {boolean}
 */
export const isConsistentTimePeriod = (start, end) =>
    !(isEmptyYear(start) && isEmptyYear(end)) &&
    (isEmptyYear(start) || isEmptyYear(end) || start <= end);

/**
 * Checks a time period given as start and end year: both years are valid and
 * the period is consistent (see isConsistentTimePeriod).
 * @param {number|null|undefined} start
 * @param {number|null|undefined} end
 * @returns {boolean}
 */
export const isValidTimePeriod = (start, end) =>
    isValidYear(start) &&
    isValidYear(end) &&
    isConsistentTimePeriod(start, end);
