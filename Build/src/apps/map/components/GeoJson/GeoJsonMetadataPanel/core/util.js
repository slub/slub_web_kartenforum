/*
 * Created by tom.schulze@pikobytes.de on 15.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { METADATA } from "@map/components/CustomLayers";
import {
    formatDateLocalized,
    parseDateLocalized,
    formatDateIso,
} from "@util/date";
import { isDefined } from "@util/util";

const TIME_PERIOD_START_FIELD_NAME = `${METADATA.timePeriod}_start`;
const TIME_PERIOD_END_FIELD_NAME = `${METADATA.timePeriod}_end`;

const coerceEmptyOrUndefinedToNull = (metadata) => {
    return Object.fromEntries(
        Object.entries(metadata).map(([key, value]) =>
            !isDefined(value) || value === "" ? [key, null] : [key, value]
        )
    );
};

const coerceUndefinedOrNullToEmptyString = (metadata) => {
    return Object.fromEntries(
        Object.entries(metadata).map(([key, value]) =>
            !isDefined(value) ? [key, ""] : [key, value]
        )
    );
};

// maps ["2015-01-01", "2015-02-01"] to localized date format for display in form fields.
// An open side of the time period (null) is shown as an empty field.
const metadataToFormTimePeriod = (metadata) => {
    const [start, end] = metadata[METADATA.timePeriod] ?? [null, null];
    const toFormDate = (date) =>
        isDefined(date) ? formatDateLocalized(date) : "";

    return {
        timePeriodStart: toFormDate(start),
        timePeriodEnd: toFormDate(end),
    };
};

// maps localized date format for display in form fields to metadata timePeriod.
// An empty field is an open side of the time period (null).
const formTimePeriodToMetadata = (start, end) => {
    const toIsoDate = (date) =>
        !isDefined(date) || date === ""
            ? null
            : formatDateIso(parseDateLocalized(date), {
                  representation: "date",
              });

    return [toIsoDate(start), toIsoDate(end)];
};

export {
    metadataToFormTimePeriod,
    formTimePeriodToMetadata,
    coerceEmptyOrUndefinedToNull,
    coerceUndefinedOrNullToEmptyString,
    TIME_PERIOD_START_FIELD_NAME,
    TIME_PERIOD_END_FIELD_NAME,
};
