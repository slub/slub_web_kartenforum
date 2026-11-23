/*
 * Created by tom.schulze@pikobytes.de on 09.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined, isString } from "@util/util";
import { parseDateIso, formatDateIso, normalizeDate } from "@util/date";
import { FEATURE_PROPERTIES } from "@map/components/GeoJson/constants";

export const boundsToPolygon = (bounds) => ({
    type: "Polygon",
    coordinates: [
        [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[1]],
            [bounds[2], bounds[3]],
            [bounds[0], bounds[3]],
            [bounds[0], bounds[1]],
        ],
    ],
});

export const convertFeatureForPersistenceState = (feature) => {
    const { properties } = feature;

    const newProperties = convertForPersistenceState(properties);

    return { ...feature, properties: newProperties };
};

export const convertFeatureForApplicationState = (feature) => {
    if (!Object.hasOwn(feature, "properties")) {
        feature.properties = {};
    }

    const { properties } = feature;

    const newProperties = convertForApplicationState(properties);

    return { ...feature, properties: newProperties };
};

const convertForApplicationState = (properties) => {
    const time = properties[FEATURE_PROPERTIES.time];

    const parsedTime = convertTimeToApplicationState(time);

    if (parsedTime.length === 0) {
        delete properties[FEATURE_PROPERTIES.time];
        return properties;
    }

    const newProperties = {
        ...properties,
        [FEATURE_PROPERTIES.time]: parsedTime,
    };

    return newProperties;
};

const convertForPersistenceState = (properties) => {
    const time = properties[FEATURE_PROPERTIES.time];

    const parsedTime = convertTimeToPersistenceState(time);

    if (parsedTime.length === 0) {
        delete properties[FEATURE_PROPERTIES.time];
        return properties;
    }

    const newProperties = {
        ...properties,
        [FEATURE_PROPERTIES.time]: parsedTime,
    };

    return newProperties;
};

// Returns `null` for an open side of a time period and `NaN` for an invalid date.
const parseTimePeriodDate = (date) => {
    if (!isDefined(date) || date === "") {
        return null;
    }

    return normalizeDate(parseDateIso(date)).valueOf();
};

// Returns `null` for an open side of a time period and "" for an invalid date.
const formatTimePeriodDate = (date) => {
    if (!isDefined(date)) {
        return null;
    }

    return formatDateIso(date);
};

const convertTimeToApplicationState = (time) => {
    if (Array.isArray(time)) {
        if (time.length !== 2) {
            return [];
        }

        const parsedStart = parseTimePeriodDate(time[0]);
        const parsedEnd = parseTimePeriodDate(time[1]);

        if (Number.isNaN(parsedStart) || Number.isNaN(parsedEnd)) {
            return [];
        }

        // a time period open on both sides is treated as no time
        if (parsedStart === null && parsedEnd === null) {
            return [];
        }

        if (
            parsedStart !== null &&
            parsedEnd !== null &&
            parsedStart > parsedEnd
        ) {
            return [parsedEnd, parsedStart];
        }

        return [parsedStart, parsedEnd];
    }

    if (isString(time)) {
        const parsedTime = normalizeDate(parseDateIso(time)).valueOf();

        if (Number.isNaN(parsedTime)) {
            return [];
        }

        return [parsedTime, parsedTime];
    }

    return [];
};

const convertTimeToPersistenceState = (time) => {
    if (!Array.isArray(time)) {
        return [];
    }

    if (time.length !== 2) {
        return [];
    }

    const parsedStart = formatTimePeriodDate(time[0]);
    const parsedEnd = formatTimePeriodDate(time[1]);

    if (parsedStart === "" || parsedEnd === "") {
        return [];
    }

    // a time period open on both sides is treated as no time
    if (parsedStart === null && parsedEnd === null) {
        return [];
    }

    return [parsedStart, parsedEnd];
};

// Limits of the JS Date range in unix milliseconds. Used in place of an open side (`null`).
const MIN_TIME = -8.64e15;
const MAX_TIME = 8.64e15;

/**.
 * Returns the maplibregl time filter expression
 * @param {[number,number]} timeExtent The time extent in unix seconds.
 * @returns maplibrgl filter expression or empty array.
 */
export const getTimeFilter = (timeExtent) => {
    if (!isDefined(timeExtent)) {
        return [];
    }

    const [min, max] = timeExtent;

    if (!isDefined(min) || !isDefined(max)) {
        return [];
    }

    return [
        "any",
        ["!", ["has", FEATURE_PROPERTIES.time]],
        [
            "all",
            [
                "<=",
                [
                    "coalesce",
                    ["at", 0, ["get", FEATURE_PROPERTIES.time]],
                    MIN_TIME,
                ],
                max * 1000,
            ],
            [
                ">=",
                [
                    "coalesce",
                    ["at", 1, ["get", FEATURE_PROPERTIES.time]],
                    MAX_TIME,
                ],
                min * 1000,
            ],
        ],
    ];
};

/**
 * Checks if a feature time period overlaps a time extent. An open side (`null`) is
 * unbounded. Features without time always overlap.
 * @param {[number|null, number|null]|undefined} time The feature time in unix milliseconds.
 * @param {[number,number]} timeExtent The time extent in unix seconds.
 * @returns {boolean}
 */
export const isTimeOverlapping = (time, timeExtent) => {
    if (!isDefined(time)) {
        return true;
    }

    const [start, end] = time;
    const [min, max] = timeExtent;

    return (start ?? MIN_TIME) <= max * 1000 && (end ?? MAX_TIME) >= min * 1000;
};

export const naiveUniqueFeatureId = (id, source) => `${id}-${source}`;

export const calculateBoundingBox = (point, offset) => {
    const { x, y } = point;
    return [
        [x - offset, y - offset],
        [x + offset, y + offset],
    ];
};
