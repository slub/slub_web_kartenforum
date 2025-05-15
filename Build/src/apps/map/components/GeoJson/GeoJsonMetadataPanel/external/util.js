/*
 * Created by tom.schulze@pikobytes.de on 09.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { METADATA } from "@map/components/CustomLayers";
import {
    formatDateIso,
    formatDateLocalized,
    parseDateLocalized,
} from "@util/date";
import { default as doValidateFeatureCollection } from "@util/schemas/validateFeatureCollection";

export const FORM_ID = "vkf-geojson-metadata-form-external-vector-map";

export const TIME_PERIOD_START = `${METADATA.timePeriod}_start`;
export const TIME_PERIOD_END = `${METADATA.timePeriod}_end`;

export const getMetadataForApi = (data) => {
    return {
        title: data[METADATA.title],
        link_content: data[METADATA.externalContentUrl],
        time_period: data[METADATA.timePeriod],
        description:
            data[METADATA.description] === ""
                ? null
                : data[METADATA.description],
        link_thumb:
            data[METADATA.thumbnailUrl] === ""
                ? null
                : data[METADATA.thumbnailUrl],
    };
};

export const toFormValues = (metadata) => {
    const data = metadata;

    const timePeriodStart = data[METADATA.timePeriod]
        ? formatDateLocalized(data[METADATA.timePeriod][0])
        : "";
    const timePeriodEnd = data[METADATA.timePeriod]
        ? formatDateLocalized(data[METADATA.timePeriod][1])
        : "";

    return {
        [METADATA.title]: data[METADATA.title],
        [METADATA.externalContentUrl]: data[METADATA.externalContentUrl],
        [TIME_PERIOD_START]: timePeriodStart,
        [TIME_PERIOD_END]: timePeriodEnd,
        [METADATA.description]: data[METADATA.description],
        [METADATA.thumbnailUrl]: data[METADATA.thumbnailUrl],
    };
};

export const toMetadata = (validatedFormValues) => {
    const data = validatedFormValues;

    const parsedStartDate = formatDateIso(
        parseDateLocalized(data[TIME_PERIOD_START]),
        {
            representation: "date",
        }
    );
    const parsedEndDate = formatDateIso(
        parseDateLocalized(data[TIME_PERIOD_END]),
        {
            representation: "date",
        }
    );

    return {
        [METADATA.title]: data[METADATA.title],
        [METADATA.externalContentUrl]: data[METADATA.externalContentUrl],
        [METADATA.timePeriod]: [parsedStartDate, parsedEndDate],
        [METADATA.description]:
            data[METADATA.description] === ""
                ? null
                : data[METADATA.description],
        [METADATA.thumbnailUrl]:
            data[METADATA.thumbnailUrl] === ""
                ? null
                : data[METADATA.thumbnailUrl],
    };
};

export const validateFeatureCollection = (geoJson) => {
    const result = doValidateFeatureCollection(geoJson);

    if (!result) {
        throw new Error("The GeoJson is not a valid FeatureCollection");
    }

    if (geoJson.features.length === 0) {
        throw new Error("The GeoJson is an empty FeatureCollection");
    }

    return result;
};

export const extractExternalVectorMapMetadata = (data) => {
    return {
        [METADATA.title]: data[METADATA.title],
        [METADATA.timePeriod]: data[METADATA.timePeriod],
        [METADATA.description]: data[METADATA.description],
        [METADATA.externalContentUrl]: data[METADATA.externalContentUrl],
        [METADATA.thumbnailUrl]: data[METADATA.thumbnailUrl],
    };
};
