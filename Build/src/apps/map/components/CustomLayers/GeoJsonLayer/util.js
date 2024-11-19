/*
 * Created by tom.schulze@pikobytes.de on 09.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined } from "@util/util";
import { parseDateIso, formatDateIso, normalizeDate } from "@util/date";
import { GEOJSON_LAYER_TYPES, LAYER_DEFINITIONS } from "./constants";
import { MAP_LIBRE_METADATA } from "../constants";
import { FEATURE_PROPERTIES } from "@map/components/GeoJson/constants";

export const getLayerConfig = (sourceId) => {
    const config = {};

    for (const key of Object.keys(GEOJSON_LAYER_TYPES)) {
        const layerType = GEOJSON_LAYER_TYPES[key];
        const layerId = `${sourceId}-${layerType}`;
        config[layerId] = {
            id: layerId,
            source: sourceId,
            metadata: {
                [MAP_LIBRE_METADATA.id]: sourceId,
            },
            ...LAYER_DEFINITIONS[layerType],
            layout: {
                ...LAYER_DEFINITIONS[layerType].layout,
                visibility: "visible",
            },
        };
    }

    return config;
};

export const convertFeatureForPersistenceState = (feature) => {
    const { properties } = feature;

    const newProperties = convertForPersistenceState(properties);

    return { ...feature, properties: newProperties };
};

export const convertFeatureForApplicationState = (feature) => {
    const { properties } = feature;

    const newProperties = convertForApplicationState(properties);

    return { ...feature, properties: newProperties };
};

const convertForApplicationState = (properties) => {
    const time = properties[FEATURE_PROPERTIES.time] ?? "";

    const parsedTime = normalizeDate(parseDateIso(time)).valueOf();

    if (Number.isNaN(parsedTime)) {
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

    const parsedTime = formatDateIso(time);

    if (parsedTime === "") {
        delete properties[FEATURE_PROPERTIES.time];
        return properties;
    }

    const newProperties = {
        ...properties,
        [FEATURE_PROPERTIES.time]: parsedTime,
    };

    return newProperties;
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
        ["!has", FEATURE_PROPERTIES.time],
        [
            "all",
            [">=", FEATURE_PROPERTIES.time, min * 1000],
            ["<=", FEATURE_PROPERTIES.time, max * 1000],
        ],
    ];
};
