/*
 * Created by tom.schulze@pikobytes.de on 05.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { atom, useRecoilCallback, useRecoilState } from "recoil";
import { useTrackGeoJsonChanges } from "@map/components/GeoJson/util/hooks/useTrackGeoJsonChanges";
import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";
import { drawModePanelState, drawState } from "@map/atoms";
import { isDefined } from "@util/util";

export const geoJsonFeatureDrawState = atom({
    key: "geoJsonFeatureDrawState",
    default: null,
});

const undoStylePropertiesState = atom({
    key: "undoStylePropertiesState",
    default: [],
});

/**
 * The hook API
 * @typedef {Object} useGeoJsonFeatureDrawAPI
 * @property {object|null} geoJsonFeature - The currently selected geoJson feature from the drawing layer or `null`
 * @property {function} setFeature - Sets the geoJsonFeature
 * @property {function} resetFeature - Resets geoJsonFeature to null and clears the hook's internal state.
 * @property {(onSuccess: function, onError: (error) => {}) => {}} saveFeature - The save handler to persist the geojsonFeature to the drawing layer. Calls onSuccess, when done and onError for failures.
 * @property {(onDone: function) => {}} deleteFeature - The  delete handler to remove the geojsonFeature from the drawing layer. Calls onDone, when done.
 * @property {function} saveFeaturePreview - Saves the feature as a preview, changes can be undone with resetFeaturePreview
 * @property {function} resetFeaturePreview - Resets changes made with saveFeaturePreview
 *
 */

/**
 * Provides a stateful API to handle the selected geoJson feature on the mapbox draw layer. Intended for use in horizontal layout only.
 *
 * A feature can be selected via mouse click only.
 *
 * @returns {...useGeoJsonFeatureDrawAPI} {@link useGeoJsonFeatureDrawAPI}
 */

const useGeoJsonFeatureDraw = () => {
    const [geoJsonFeature, setFeature] = useRecoilState(
        geoJsonFeatureDrawState
    );

    const { handleDeleteFeature, handleUpdateFeature } =
        useTrackGeoJsonChanges();

    const saveFeature = useRecoilCallback(
        ({ snapshot }) =>
            async (
                { addOrUpdateProperties, removeProperties },
                onSuccess,
                onError
            ) => {
                const draw = await snapshot.getPromise(drawState);
                const geoJsonFeature = await snapshot.getPromise(
                    geoJsonFeatureDrawState
                );

                const localFeature = Object.assign({}, geoJsonFeature);
                try {
                    const { properties } = localFeature;
                    const mergedProperties = Object.assign({}, properties);

                    for (const key of removeProperties) {
                        delete mergedProperties[key];
                    }

                    for (const { key, value } of addOrUpdateProperties) {
                        mergedProperties[key] = value;
                    }

                    localFeature.properties = mergedProperties;

                    // prevent the feature from jumping back to its original location
                    // user might have moved the feature in between clicking on the feature and hitting the save button
                    const drawFeature = draw.get(localFeature.id);
                    const { geometry } = drawFeature;
                    localFeature.geometry = geometry;

                    handleUpdateFeature(localFeature);
                    draw.add(localFeature);
                    if (
                        isDefined(onSuccess) &&
                        typeof onSuccess === "function"
                    ) {
                        onSuccess();
                    }
                } catch (error) {
                    if (isDefined(onError) && typeof onError === "function") {
                        onError(error);
                    }
                }
            },
        []
    );

    const saveFeaturePreview = useRecoilCallback(
        ({ snapshot, set }) =>
            async (key, newValue) => {
                const draw = await snapshot.getPromise(drawState);
                const geoJsonFeature = await snapshot.getPromise(
                    geoJsonFeatureDrawState
                );

                const { id } = geoJsonFeature;
                const undoValue = geoJsonFeature.properties[key];

                set(undoStylePropertiesState, (old) => [
                    ...old,
                    [id, key, undoValue],
                ]);
                draw.setFeatureProperty(id, key, newValue);
                // HACK: https://github.com/mapbox/mapbox-gl-draw/issues/878
                draw.add(draw.get(id));
            },
        []
    );

    const deleteFeature = useRecoilCallback(
        ({ snapshot }) =>
            async (onDone) => {
                const draw = await snapshot.getPromise(drawState);
                const geoJsonFeature = await snapshot.getPromise(
                    geoJsonFeatureDrawState
                );

                const { id } = geoJsonFeature;

                draw.delete(id);
                handleDeleteFeature(id);

                if (isDefined(onDone) && typeof onDone === "function") {
                    onDone();
                }
            },
        []
    );

    const resetFeaturePreview = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const undoStyleProperties = await snapshot.getPromise(
                    undoStylePropertiesState
                );
                const draw = await snapshot.getPromise(drawState);

                for (const params of undoStyleProperties) {
                    draw.setFeatureProperty(...params);
                }
                set(undoStylePropertiesState, []);
            },
        []
    );

    const resetFeature = useRecoilCallback(
        ({ snapshot, set }) =>
            async (
                { skipPanelState, skipResetPreview, skipDeselect } = {
                    skipResetPreview: false,
                    skipPanelState: false,
                    skipDeselect: false,
                }
            ) => {
                const draw = await snapshot.getPromise(drawState);

                // skip e.g., when switching directly from selected feature to draw mode
                if (!skipDeselect) {
                    // deselect feature (unfortunately by deselecting all features, specific ids don't work)
                    draw.changeMode("simple_select", { featureIds: [] });
                }

                // skip e.g., on save
                if (!skipResetPreview) {
                    resetFeaturePreview();
                }

                // skip e.g., when another panel opens
                if (!skipPanelState) {
                    set(drawModePanelState, DRAW_MODE_PANEL_STATE.NONE);
                }

                set(undoStylePropertiesState, []);
                set(geoJsonFeatureDrawState, null);
            },
        [resetFeaturePreview]
    );

    return {
        geoJsonFeature,
        setFeature,
        resetFeature,
        resetFeaturePreview,
        saveFeature,
        saveFeaturePreview,
        deleteFeature,
    };
};

export default useGeoJsonFeatureDraw;
