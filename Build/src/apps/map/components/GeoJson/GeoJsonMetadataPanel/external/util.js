/*
 * Created by tom.schulze@pikobytes.de on 09.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { EXTERNAL_CONTENT_TYPES, METADATA } from "@map/components/CustomLayers";
import { default as doValidateFeatureCollection } from "@util/schemas/validateFeatureCollection";
import {
    coerceEmptyOrUndefinedToNull,
    formTimePeriodToMetadata,
    metadataToFormTimePeriod,
    TIME_PERIOD_START_FIELD_NAME,
    TIME_PERIOD_END_FIELD_NAME,
    coerceUndefinedOrNullToEmptyString,
} from "../core/util";
import { isDefined } from "@util/util";

export const FORM_ID = "vkf-geojson-metadata-form-external-vector-map";

export const CONTENT_TYPE_OPTIONS = [
    { label: "VKF", value: EXTERNAL_CONTENT_TYPES.VKF },
    { label: "IDOHIST", value: EXTERNAL_CONTENT_TYPES.IDOHIST },
];

export const metadataLayerToExternal = (metadata) => {
    return {
        [METADATA.title]: metadata[METADATA.title],
        [METADATA.timePeriod]: metadata[METADATA.timePeriod],
        [METADATA.description]: metadata[METADATA.description],
        [METADATA.externalContentUrl]: metadata[METADATA.externalContentUrl],
        [METADATA.externalContentType]: metadata[METADATA.externalContentType],
        [METADATA.thumbnailUrl]: metadata[METADATA.thumbnailUrl],
    };
};

export const metadataExternalToApi = (metadata) => {
    const apiMetadata = {
        title: metadata[METADATA.title],
        link_content: metadata[METADATA.externalContentUrl],
        content_type: metadata[METADATA.externalContentType],
        time_period: metadata[METADATA.timePeriod],
        description: metadata[METADATA.description],
        link_thumb: metadata[METADATA.thumbnailUrl],
    };

    return coerceEmptyOrUndefinedToNull(apiMetadata);
};

export const metadataExternalToForm = (metadata) => {
    const { timePeriodStart, timePeriodEnd } =
        metadataToFormTimePeriod(metadata);

    // set the default content type if none is given
    const contentType = metadata[METADATA.externalContentType];
    const contentTypeOrDefault =
        isDefined(contentType) && contentType !== ""
            ? contentType
            : EXTERNAL_CONTENT_TYPES.VKF;

    const data = {
        [METADATA.title]: metadata[METADATA.title],
        [METADATA.externalContentUrl]: metadata[METADATA.externalContentUrl],
        [METADATA.externalContentType]: contentTypeOrDefault,
        [TIME_PERIOD_START_FIELD_NAME]: timePeriodStart,
        [TIME_PERIOD_END_FIELD_NAME]: timePeriodEnd,
        [METADATA.description]: metadata[METADATA.description],
        [METADATA.thumbnailUrl]: metadata[METADATA.thumbnailUrl],
    };

    return coerceUndefinedOrNullToEmptyString(data);
};

export const formExternalToMetadata = (validatedFormValues) => {
    const data = validatedFormValues;
    const start = data[TIME_PERIOD_START_FIELD_NAME];
    const end = data[TIME_PERIOD_END_FIELD_NAME];

    const timePeriod = formTimePeriodToMetadata(start, end);

    const metadata = {
        [METADATA.title]: data[METADATA.title],
        [METADATA.externalContentUrl]: data[METADATA.externalContentUrl],
        [METADATA.externalContentType]: data[METADATA.externalContentType],
        [METADATA.timePeriod]: timePeriod,
        [METADATA.description]: data[METADATA.description],
        [METADATA.thumbnailUrl]: data[METADATA.thumbnailUrl],
    };

    return metadata;
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
