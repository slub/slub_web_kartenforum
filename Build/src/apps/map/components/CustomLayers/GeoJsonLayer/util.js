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
    const time = properties[FEATURE_PROPERTIES.time] ?? "";

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
    const time = properties[FEATURE_PROPERTIES.time] ?? "";

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

const convertTimeToApplicationState = (time) => {
    if (Array.isArray(time)) {
        if (time.length !== 2) {
            return [];
        }

        const parsedStart = normalizeDate(parseDateIso(time[0])).valueOf();
        const parsedEnd = normalizeDate(parseDateIso(time[1])).valueOf();

        if (Number.isNaN(parsedStart) || Number.isNaN(parsedEnd)) {
            return [];
        }

        if (parsedStart > parsedEnd) {
            return [parsedEnd, parsedStart];
        }

        return [parsedStart, parsedEnd];
    }

    if (isString(time)) {
        const parsedTime = normalizeDate(parseDateIso(time)).valueOf();

        if (Number.isNaN(time)) {
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

    const parsedStart = formatDateIso(time[0]);
    const parsedEnd = formatDateIso(time[1]);

    if (parsedStart === "" || parsedEnd === "") {
        return [];
    }

    return [parsedStart, parsedEnd];
};

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
            ["<=", ["at", 0, ["get", FEATURE_PROPERTIES.time]], max * 1000],
            [">=", ["at", 1, ["get", FEATURE_PROPERTIES.time]], min * 1000],
        ],
    ];
};

export const naiveUniqueFeatureId = (id, source) => `${id}-${source}`;

export const calculateBoundingBox = (point, offset) => {
    const { x, y } = point;
    return [
        [x - offset, y - offset],
        [x + offset, y + offset],
    ];
};
