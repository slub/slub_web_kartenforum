/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { FEATURE_PROPERTIES } from "@map/components/GeoJson/constants";

export const FILTERABLE_PROPERTIES = [
    FEATURE_PROPERTIES.title,
    FEATURE_PROPERTIES.description,
];

export const INDEX_OPTIONS = {
    isCaseSensitive: false,
    keys: FILTERABLE_PROPERTIES.map((property) => `properties.${property}`),
    threshold: 0,
    ignoreLocation: true,
};
