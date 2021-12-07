/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { atom } from "recoil";

export const displayedLayersCountState = atom({
    key: "displayedLayersCount",
    default: 0,
});

export const facetState = atom({
    key: "facetState",
    default: { facets: [], georeference: false },
});

export const mapSearchListFunctionalityProvidersState = atom({
    key: "mapSearchListFunctionalityProviders",
    default: { mapOverlayLayer: undefined, mapPaginationSource: undefined },
    dangerouslyAllowMutability: true,
});

export const mapsInViewportState = atom({
    key: "mapsInViewportState",
    default: { maps: [], mapCount: 0 },
});

export const mapState = atom({
    key: "mapState",
    default: undefined,
    dangerouslyAllowMutability: true,
});

export const map3dState = atom({
    key: "map3dState",
    default: false,
});

export const olcsMapState = atom({
    key: "olcsMapState",
    default: undefined,
    dangerouslyAllowMutability: true,
});

export const selectedFeaturesState = atom({
    key: "selectedFeatureState",
    default: [],
});

export const selectedOriginalMapIdState = atom({
    key: "selectedOriginalMapIdState",
    default: undefined,
});

export const timeExtentState = atom({
    key: "timeExtentState",
    default: [1850, 1970],
});

export const timeRangeState = atom({
    key: "timeRangeState",
    default: [1850, 1970],
});
