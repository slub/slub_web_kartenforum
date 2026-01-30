/*
 * Created by tom.schulze@pikobytes.de on 08.09.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { SORT_STATE } from "@components/SortControl/SortControl";
import { FEATURE_PROPERTIES } from "@map/components/GeoJson/constants";
import { isDefined } from "@util/util";

const getStringValue = (feature, key) => {
    if (!isDefined(feature.properties) || !isDefined(feature.properties[key])) {
        return "";
    }

    return feature.properties[key].trim().toLowerCase();
};

const getTimeValue = (feature) => {
    if (
        !isDefined(feature.properties) ||
        !isDefined(feature.properties[FEATURE_PROPERTIES.time])
    ) {
        return Number.NEGATIVE_INFINITY;
    }

    // use start date
    return feature.properties[FEATURE_PROPERTIES.time][0];
};

// expects values that can be compared with < or >
export const sortFeatures = (key, sortOrder) => (featureA, featureB) => {
    const orderModifier = sortOrder === SORT_STATE.ASCENDING ? 1 : -1;

    let valueA = "";
    let valueB = "";

    if (key === FEATURE_PROPERTIES.time) {
        valueA = getTimeValue(featureA);
        valueB = getTimeValue(featureB);
    } else {
        valueA = getStringValue(featureA, key);
        valueB = getStringValue(featureB, key);
    }

    if (valueA > valueB) {
        return 1 * orderModifier;
    }

    if (valueA < valueB) {
        return -1 * orderModifier;
    }

    return 0;
};
