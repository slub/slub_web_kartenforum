/*
 * Created by tom.schulze@pikobytes.de on 15.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { METADATA } from "@map/components/CustomLayers";
import {
    coerceEmptyOrUndefinedToNull,
    metadataToFormTimePeriod,
    formTimePeriodToMetadata,
    TIME_PERIOD_START_FIELD_NAME,
    TIME_PERIOD_END_FIELD_NAME,
    coerceUndefinedOrNullToEmptyString,
} from "../core/util";

const metadataLayerToDraw = (metadata) => {
    return {
        [METADATA.title]: metadata[METADATA.title],
        [METADATA.description]: metadata[METADATA.description],
        [METADATA.thumbnailUrl]: metadata[METADATA.thumbnailUrl],
        [METADATA.timePeriod]: metadata[METADATA.timePeriod],
    };
};

const metadataDrawToApi = (metadata) => {
    const apiMetadata = {
        link_thumb: metadata[METADATA.thumbnailUrl],
        title: metadata[METADATA.title],
        description: metadata[METADATA.description],
        time_period: metadata[METADATA.timePeriod],
    };

    return coerceEmptyOrUndefinedToNull(apiMetadata);
};

export const metadataDrawToForm = (metadata) => {
    const { timePeriodStart, timePeriodEnd } =
        metadataToFormTimePeriod(metadata);

    const data = {
        [METADATA.title]: metadata[METADATA.title],
        [TIME_PERIOD_START_FIELD_NAME]: timePeriodStart,
        [TIME_PERIOD_END_FIELD_NAME]: timePeriodEnd,
        [METADATA.description]: metadata[METADATA.description],
        [METADATA.thumbnailUrl]: metadata[METADATA.thumbnailUrl],
    };

    return coerceUndefinedOrNullToEmptyString(data);
};

export const formDrawToMetadata = (validatedFormValues) => {
    const data = validatedFormValues;
    const start = data[TIME_PERIOD_START_FIELD_NAME];
    const end = data[TIME_PERIOD_END_FIELD_NAME];

    const timePeriod = formTimePeriodToMetadata(start, end);

    const metadata = {
        [METADATA.title]: data[METADATA.title],
        [METADATA.timePeriod]: timePeriod,
        [METADATA.description]: data[METADATA.description],
        [METADATA.thumbnailUrl]: data[METADATA.thumbnailUrl],
    };

    return metadata;
};

export { metadataLayerToDraw, metadataDrawToApi };
