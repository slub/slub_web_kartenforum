/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { atom } from "recoil";

export const facetState = atom({
    key: "facetState",
    default: [],
});

export const timeRangeState = atom({
    key: "timeRangeState",
    default: [1850, 1970],
});

export const timeExtentState = atom({
    key: "timeExtentState",
    default: [1850, 1970],
});

export const selectedFeaturesState = atom({
    key: "selectedFeatureState",
    default: [],
});

export const featureState = atom({
    key: "featureState",
    default: { features: [], featureCount: 0 },
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

export const mapState = atom({
    key: "mapState",
    default: undefined,
    dangerouslyAllowMutability: true,
});
