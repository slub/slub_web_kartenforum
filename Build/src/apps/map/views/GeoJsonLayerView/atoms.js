/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { atom, selector } from "recoil";
import { getUnixSeconds, isValidDate, normalizeDate } from "@util/date";
import { selectedGeoJsonLayerLastUpdatedState } from "@map/atoms";

export const GEOJSON_LAYER_VIEW_MODE = {
    INITIAL: 1,
    FILTER: 2,
    EDIT: 3,
};

export const geoJsonLayerViewViewModeState = atom({
    key: "geoJsonLayerViewViewModeState",
    default: GEOJSON_LAYER_VIEW_MODE.INITIAL,
});

export const geoJsonLayerViewLayerState = atom({
    key: "geoJsonLayerViewLayerState",
    default: null,
    dangerouslyAllowMutability: true,
});

export const geoJsonLayerViewFeaturesState = selector({
    key: "geoJsonLayerViewFeaturesState",
    get: ({ get }) => {
        const selectedLayer = get(geoJsonLayerViewLayerState);
        get(selectedGeoJsonLayerLastUpdatedState);

        return selectedLayer?.getGeoJson()?.features ?? [];
    },
    dangerouslyAllowMutability: true,
});

export const geoJsonLayerViewTimeExtentFilterState = atom({
    key: "geoJsonLayerViewTimeExtentFilterState",
    default: null,
});

export const geoJsonLayerViewTimeRangeState = selector({
    key: "geoJsonLayerViewTimeRangeState",
    get: ({ get }) => {
        const geoJsonFeatures = get(geoJsonLayerViewFeaturesState);

        let minDate = Number.NaN;
        let maxDate = Number.NaN;

        for (const feature of geoJsonFeatures) {
            const time = feature.properties.time ?? [];
            const [start, end] = time;

            if (!isValidDate(start) || !isValidDate(end)) {
                continue;
            }

            if (Number.isNaN(minDate)) {
                minDate = start;
            }

            if (Number.isNaN(maxDate)) {
                maxDate = end;
            }

            if (start < minDate) {
                minDate = start;
            }

            if (end > maxDate) {
                maxDate = end;
            }
        }

        if (minDate === maxDate) {
            return [];
        }

        if (Number.isNaN(minDate) || Number.isNaN(maxDate)) {
            return [];
        }

        minDate = getUnixSeconds(normalizeDate(minDate));
        maxDate = getUnixSeconds(normalizeDate(maxDate));

        return [minDate, maxDate];
    },
});

export const geoJsonLayerViewIsValidTimeRangeState = selector({
    key: "geoJsonLayerViewIsValidTimeRangeState",
    get: ({ get }) => {
        const timeRange = get(geoJsonLayerViewTimeRangeState);
        return timeRange.length === 2;
    },
});

export const geoJsonLayerViewFilteredFeaturesState = selector({
    key: "geoJsonLayerViewFilteredFeaturesState",
    get: ({ get }) => {
        const viewMode = get(geoJsonLayerViewViewModeState);
        const geoJsonFeatures = get(geoJsonLayerViewFeaturesState);

        // If we are not in filter view mode, return all features
        if (viewMode !== GEOJSON_LAYER_VIEW_MODE.FILTER) {
            return geoJsonFeatures;
        }

        let filteredFeatures = geoJsonFeatures;

        const timeExtentFilter = get(geoJsonLayerViewTimeExtentFilterState);

        if (timeExtentFilter !== null) {
            const [min, max] = timeExtentFilter;
            filteredFeatures = filteredFeatures.filter(({ properties }) => {
                const [start, end] = properties?.time ?? [];

                const unixTimestampStart = getUnixSeconds(normalizeDate(start));
                const unixTimestampEnd = getUnixSeconds(normalizeDate(end));

                if (
                    Number.isNaN(unixTimestampStart) ||
                    Number.isNaN(unixTimestampEnd)
                ) {
                    return true;
                }

                return unixTimestampStart <= max && unixTimestampEnd >= min;
            });
        }

        return filteredFeatures;
    },
});

export const geoJsonLayerViewExistFilteredFeaturesState = selector({
    key: "geoJsonLayerViewExistFilteredFeaturesState",
    get: ({ get }) => {
        const filteredFeatures = get(geoJsonLayerViewFilteredFeaturesState);
        return filteredFeatures.length > 0;
    },
});

export const geoJsonLayerViewMapFilters = selector({
    key: "geoJsonLayerViewMapFilters",
    get: ({ get }) => {
        const viewMode = get(geoJsonLayerViewViewModeState);
        const timeExtentFilter = get(geoJsonLayerViewTimeExtentFilterState);

        if (viewMode !== GEOJSON_LAYER_VIEW_MODE.FILTER) {
            return null;
        }

        if (timeExtentFilter === null) {
            return null;
        }

        return { timeExtent: timeExtentFilter };
    },
});
