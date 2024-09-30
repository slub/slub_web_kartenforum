/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { atom } from "recoil";
import { VALUE_CREATE_NEW_MAP } from "../components/MosaicMapSelectorDropdown/MosaicMapSelectorDropdown.jsx";

// maps selected for the current mosaic map
export const mosaicMapSelectedFeaturesState = atom({
    key: "mosaicMapSelectedFeaturesState",
    default: [],
    dangerouslyAllowMutability: true,
});

// allows accessing the mosaic map geometry layer
export const mosaicMapGeometryLayerState = atom({
    key: "mosaicMapGeometryLayerState",
    default: undefined,
    dangerouslyAllowMutability: true,
});

// represents the metadata of a HistoricMapLayer
export const mosaicMapSelectedMosaicMapState = atom({
    key: "mosaicMapSelectedMosaicMapState",
    default: { id: VALUE_CREATE_NEW_MAP },
});

export const MosaicMapLoadingStates = {
    NOT_LOADING: 0,
    UPLOADING_CHANGES: 1,
    DOWNLOADING_LIST: 2,
};

// determines the current loading state of the mosaic map dropdown
export const mosaicMapLoadingState = atom({
    key: "mosaicMapLoadingState",
    default: MosaicMapLoadingStates.NOT_LOADING,
});
