/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { atom } from "recoil";
import { LAYOUT_TYPES } from "../layouts/util.js";

// stores the currently active basemap ID
export const activeBasemapIdState = atom({
    key: "activeBasemapId",
    default: null,
});

// current state for the persistence controller
export const currentApplicationStateState = atom({
    key: "currentApplicationState",
    default: undefined,
});

// number of currently displayed layers
export const displayedLayersCountState = atom({
    key: "displayedLayersCount",
    default: 0,
});

// indicates the screen size of different elements
export const elementsScreenSizeState = atom({
    key: "elementScreenSize",
    default: {
        map: { height: 0, width: 0 },
        layermanagement: { height: 0, width: 0 },
        padding: { height: 15, width: 15 },
        offset: { height: 15, width: 0 },
        spatialtemporalsearch: { height: 0, width: 0 },
    },
});

export const defaultFacetState = { facets: [], georeference: false };
// the search state
export const facetState = atom({
    key: "facetState",
    default: { facets: [], georeference: false },
});

// indicates if its vertical or horizontal layout
export const layoutState = atom({
    key: "layoutState",
    default: LAYOUT_TYPES.VERTICAL,
});

// allows accessing the map
export const mapState = atom({
    key: "mapState",
    default: undefined,
    dangerouslyAllowMutability: true,
});

// flag indicating if the map is in 3d mode or not
export const map3dState = atom({
    key: "map3dState",
    default: false,
});

// number of maps in the current viewport of the map
export const mapCountState = atom({
    key: "mapCountState",
    default: 10,
});

// stores the openlayers-cesium map
export const olcsMapState = atom({
    key: "olcsMapState",
    default: undefined,
    dangerouslyAllowMutability: true,
});

// flag indicating if the search is loading
export const searchIsLoadingState = atom({
    key: "searchIsLoadingState",
    default: false,
});

// selected Features
export const selectedFeaturesState = atom({
    key: "selectedFeatureState",
    default: [],
});

export const selectedGeoJsonFeatureState = atom({
    key: "selectedGeoJsonFeatureState",
    default: null,
    dangerouslyAllowMutability: true,
});

// id of the selected map in order to show the original map view
export const selectedOriginalMapIdState = atom({
    key: "selectedOriginalMapIdState",
    default: undefined,
});

// time extent selected by the time slider
export const timeExtentState = atom({
    key: "timeExtentState",
    default: [1850, 1970],
});

export const defaultTimeRange = [1850, 1970];
// allowed max range for the time slider
export const timeRangeState = atom({
    key: "timeRangeState",
    default: defaultTimeRange,
});
