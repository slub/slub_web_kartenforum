/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { atom, selector } from "recoil";
import SettingsProvider from "@settings-provider";
import { ActiveDialog } from "@map/components/VkfMap/constants.js";
import {
    HORIZONTAL_LAYOUT_MODE,
    LAYOUT_TYPES,
    DRAW_MODE_PANEL_STATE,
    VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE,
} from "@map/layouts/util.js";
import { isDefined } from "@util/util";
import { METADATA } from "@map/components/CustomLayers";

// stores the currently active basemap ID
export const activeBasemapIdState = atom({
    key: "activeBasemapId",
    default: SettingsProvider.getSettings().BASEMAPS[0].id,
});

// current state for the persistence controller
export const currentApplicationStateState = atom({
    key: "currentApplicationState",
    default: undefined,
});

// indicates the screen size of different elements
export const elementsScreenSizeState = atom({
    key: "elementScreenSize",
    default: {
        map: { height: 0, width: 0 },
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

// indicates the mode of the horizontal layout
export const horizontalLayoutModeState = atom({
    key: "horizontalLayoutModeState",
    default: HORIZONTAL_LAYOUT_MODE.STANDARD,
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

// flag indicating if the search is loading
export const searchIsLoadingState = atom({
    key: "searchIsLoadingState",
    default: false,
});

/**
 * Tracks the selected application layers e.g., HistoricMapLayer, GeoJsonLayer.
 */
export const selectedLayersState = atom({
    key: "selectedLayersState",
    default: [],
    dangerouslyAllowMutability: true,
});

// id of the selected map in order to show the original map view
export const selectedOriginalMapIdState = atom({
    key: "selectedOriginalMapIdState",
    default: undefined,
});

// The id of the GeoJson layer to be displayed in GeoJsonLayerPanel
export const selectedGeoJsonLayerIdState = atom({
    key: "selectedGeoJsonLayerIdState",
    default: undefined,
});

// Should trigger state updates when a GeoJson feature is created, updated or deleted from a layer
export const selectedGeoJsonLayerLastUpdatedState = atom({
    key: "selectedGeoJsonLayerLastUpdatedState",
    default: 0,
});

// Triggers a state update in the geojson layer panel
export const selectedGeoJsonLayerState = selector({
    key: "selectedGeoJsonLayerState",
    get: ({ get }) => {
        const selectedId = get(selectedGeoJsonLayerIdState);
        const layers = get(selectedLayersState);
        const lastUpdated = get(selectedGeoJsonLayerLastUpdatedState);
        const selectedLayer = layers.find(
            (layer) => layer.getId() === selectedId
        );
        return { selectedLayer, lastUpdated };
    },
    dangerouslyAllowMutability: true,
});

// type: {featureId: string|number, sourceId: string} | null
export const selectedGeoJsonFeatureIdentifierState = atom({
    key: "selectedGeoJsonFeatureIdentifierState",
    default: null,
});

// Tracks whether or not a geojson feature is displayed in GeoJsonFeaturePanel (to toggle animations)
export const isGeoJsonFeatureSelectedState = selector({
    key: "isGeoJsonFeatureSelectedState",
    get: ({ get }) => {
        const selectedGeoJsonFeatureIdentifier = get(
            selectedGeoJsonFeatureIdentifierState
        );

        if (!isDefined(selectedGeoJsonFeatureIdentifier)) {
            return false;
        }

        const { featureId, sourceId } = selectedGeoJsonFeatureIdentifier;

        return isDefined(featureId) && isDefined(sourceId);
    },
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

export const baseMapStyleLayersState = atom({
    key: "baseMapStyleLayersState",
    default: [],
});

// store the current active dialog in control container
export const activeDialogState = atom({
    key: "activeDialogState",
    default: ActiveDialog.None,
});

export const drawState = atom({
    key: "drawState",
    default: undefined,
});

// Geojson edit states
export const initialGeoJsonDrawState = atom({
    key: "editedGeojsonState",
    default: null,
});

// { [METADATA_KEY]: string | number | null }
export const metadataDrawState = atom({
    key: "metadataDrawState",
    default: null,
});

// { type:  "remote" | "local", id: string | null }
export const vectorMapDrawState = atom({
    key: "vectorMapState",
    default: null,
});

export const vectorMapActiveVersionDrawState = atom({
    key: "vectorMapActiveVersionDrawState",
    default: null,
});

export const isActiveVectorMapVersionDifferentState = selector({
    key: "isActiveVectorMapVersionDifferentState",
    get: ({ get }) => get(vectorMapActiveVersionDrawState) !== null,
});

// Add geojson states
export const showDropZoneState = atom({
    key: "showDropZoneState",
    default: false,
});

export const addedFileState = atom({
    key: "addedFileState",
    default: null,
});

export const addGeoJsonDialogState = atom({
    key: "addGeoJsonDialogState",
    default: false,
});

// HorizontalLayoutDraw panel state
export const drawModePanelState = atom({
    key: "drawModePanelState",
    default: DRAW_MODE_PANEL_STATE.NONE,
});

// HorizontalLayoutVectorMapExternal panel state
export const vectorMapExternalModePanelState = atom({
    key: "vectorMapExternalModePanelState",
    default: VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE.NONE,
});

export const layerExternalVectorMapState = atom({
    key: "layerExternalVectorMapState",
    default: null,
    dangerouslyAllowMutability: true,
});

export const forceUpdateLayerExternalVectorMapState = atom({
    key: "forceUpdateLayerExternalVectorMapState",
    default: 0,
});

export const metadataExternalVectorMapState = selector({
    key: "metadataExternalVectorMapState",
    get: ({ get }) => {
        get(forceUpdateLayerExternalVectorMapState);
        const layer = get(layerExternalVectorMapState);

        if (!isDefined(layer)) {
            return null;
        }

        return {
            [METADATA.title]: layer.getMetadata(METADATA.title),
            [METADATA.description]: layer.getMetadata(METADATA.description),
            [METADATA.thumbnailUrl]: layer.getMetadata(METADATA.thumbnailUrl),
            [METADATA.externalContentUrl]: layer.getMetadata(
                METADATA.externalContentUrl
            ),
            [METADATA.timePeriod]: layer.getMetadata(METADATA.timePeriod),
        };
    },
    dangerouslyAllowMutability: true,
});

export const geojsonExternalVectorMapState = selector({
    key: "geojsonExternalVectorMapState",
    get: ({ get }) => {
        get(forceUpdateLayerExternalVectorMapState);
        const layer = get(layerExternalVectorMapState);

        if (!isDefined(layer)) {
            return null;
        }

        return layer.getGeoJson();
    },
    dangerouslyAllowMutability: true,
});

// does not change throughout edit/create flow
export const layerIdExternalVectorMapState = selector({
    key: "layerIdExternalVectorMapState",
    get: ({ get }) => {
        const layer = get(layerExternalVectorMapState);

        if (!isDefined(layer)) {
            return null;
        }

        return layer.getId();
    },
    dangerouslyAllowMutability: true,
});
