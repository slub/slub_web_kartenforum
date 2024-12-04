/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { atom, selector } from "recoil";
import { getUnixSeconds, isValidDate, normalizeDate } from "@util/date";
import Fuse from "fuse.js";
import { INDEX_OPTIONS } from "@map/views/GeoJsonLayerView/constants";

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
        const timestamps = geoJsonFeatures
            .map(({ properties }) => new Date(properties.time))
            .filter((date) => isValidDate(date))
            .sort((a, b) => a.valueOf() - b.valueOf());

        if (timestamps.length < 2) {
            return [];
        }

        const minDate = getUnixSeconds(normalizeDate(timestamps[0]));
        const maxDate = getUnixSeconds(
            normalizeDate(timestamps[timestamps.length - 1])
        );

        if (minDate === maxDate) {
            return [];
        }

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

export const geoJsonLayerViewFullTextFilterState = atom({
    key: "geoJsonLayerViewFullTextFilterState",
    default: "",
});

export const geoJsonLayerViewFullTextIndex = selector({
    key: "geoJsonLayerViewFullTextIndex",
    get: ({ get }) => {
        const geoJsonFeatures = get(geoJsonLayerViewFeaturesState);

        return new Fuse(geoJsonFeatures, INDEX_OPTIONS);
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

        const fullTextFilter = get(geoJsonLayerViewFullTextFilterState);

        let filteredFeatures = geoJsonFeatures;

        if (fullTextFilter.length > 0) {
            const fullTextIndex = get(geoJsonLayerViewFullTextIndex);
            filteredFeatures = fullTextIndex
                .search(fullTextFilter)
                .map((r) => r.item);
        }

        const timeExtentFilter = get(geoJsonLayerViewTimeExtentFilterState);

        if (timeExtentFilter !== null) {
            const [min, max] = timeExtentFilter;
            filteredFeatures = filteredFeatures.filter(({ properties }) => {
                const timestamp = properties.time;
                const unixTimestamp = getUnixSeconds(
                    normalizeDate(new Date(timestamp))
                );

                if (Number.isNaN(unixTimestamp)) {
                    return true;
                }

                return unixTimestamp >= min && unixTimestamp <= max;
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
        const fullTextFilter = get(geoJsonLayerViewFullTextFilterState);

        if (viewMode !== GEOJSON_LAYER_VIEW_MODE.FILTER) {
            return null;
        }

        if (timeExtentFilter === null && fullTextFilter.length === 0) {
            return null;
        }

        const filter = {};

        if (timeExtentFilter !== null) {
            filter.timeExtent = timeExtentFilter;
        }

        if (fullTextFilter.length > 0) {
            filter.fullText = fullTextFilter;
        }

        return filter;
    },
});
