/*
 * Created by tom.schulze@pikobytes.de on 22.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useEffect, useCallback, useState, useRef } from "react";
import { isDefined } from "@util/util";
import { useRecoilValue, useRecoilState } from "recoil";
import { drawModePanelState, drawState, mapState } from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";

const USER_PROPERTY_PREFIX = "user_";

const DRAW_LAYER = {
    HOT: "mapbox-gl-draw-hot",
    COLD: "mapbox-gl-draw-cold",
};

const MODE = {
    DIRECT_SELECT: "direct_select",
    SIMPLE_SELECT: "simple_select",
};

const isDrawingFeature = (feature) => {
    const { source } = feature;
    const { properties } = feature;

    const { meta, mode } = properties;

    const isDrawingSource =
        (source === DRAW_LAYER.COLD || source === DRAW_LAYER.HOT) &&
        meta === "feature";

    const isNotBeingDrawn =
        mode === MODE.DIRECT_SELECT || mode === MODE.SIMPLE_SELECT;

    return isDrawingSource && isNotBeingDrawn;
};

const getFeatureProperties = (drawFeature) => {
    const { properties, type, geometry } = drawFeature;
    const { id } = properties;

    // retain user properties only and remove prefix
    const userProperties = Object.entries(properties)
        .filter(([key]) => key.startsWith(USER_PROPERTY_PREFIX))
        .map(([key, value]) => {
            const userKey = key.slice(USER_PROPERTY_PREFIX.length);
            return [userKey, value];
        });

    return {
        id,
        geometry,
        properties: Object.fromEntries(userProperties),
        type,
    };
};

const calculateBoundingBox = (point, offset) => {
    const { x, y } = point;
    return [
        [x - offset, y - offset],
        [x + offset, y + offset],
    ];
};

// https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md
const CLICK_BUFFER = 2;

/**
 * The hook API
 * @typedef {Object} useGeoJsonFeatureDrawAPI
 * @property {object} geoJsonFeature - The currently selected geoJson feature from the drawing layer.
 * @property {(onSuccess: function, onError: (error) => {}) => {}} saveFeature - The save handler to persist the geojsonFeature to the drawing layer. Calls onSuccess, when done and onError for failures.
 * @property {(onDone: function) => {}} deleteFeature - The  delete handler to remove the geojsonFeature from the drawing layer. Calls onDone, when done.
 * @property {function} resetFeature - Resets geoJsonFeature to null and clears the hook's internal state.
 */

/**
 * Provides a stateful API to handle the selected geoJson feature on the mapbox draw layer. Intended for use in horizontal layout only.
 *
 * A feature can be selected via mouse click only.
 *
 * @returns {...useGeoJsonFeatureDrawAPI | null} {@link useGeoJsonFeatureDrawAPI} or `null`
 */

const useGeoJsonFeatureDraw = () => {
    const map = useRecoilValue(mapState);
    const draw = useRecoilValue(drawState);
    const [drawModePanel, setDrawModePanel] =
        useRecoilState(drawModePanelState);

    const [geoJsonFeature, setGeoJsonFeature] = useState(null);

    // don't trigger a state update when same feature is clicked again
    const uniqueCachedFeatureId = useRef(null);

    const saveFeature = useCallback(
        ({ addOrUpdateProperties, removeProperties }, onSuccess, onError) => {
            try {
                const { properties } = geoJsonFeature;

                const mergedProperties = Object.assign({}, properties);

                for (const key of removeProperties) {
                    delete mergedProperties[key];
                }

                for (const { key, value } of addOrUpdateProperties) {
                    mergedProperties[key] = value;
                }

                geoJsonFeature.properties = mergedProperties;

                // prevent the feature from jumping back to its original location
                // user might have moved the feature in between clicking on the feature and hitting the save button
                const drawFeature = draw.get(geoJsonFeature.id);
                const { geometry } = drawFeature;
                geoJsonFeature.geometry = geometry;

                draw.add(geoJsonFeature);
                if (isDefined(onSuccess) && typeof onSuccess === "function") {
                    onSuccess();
                }
            } catch (error) {
                if (isDefined(onError) && typeof onError === "function") {
                    onError(error);
                }
            }
        },
        [draw, geoJsonFeature]
    );

    const deleteFeature = useCallback(
        (onDone) => {
            const { id } = geoJsonFeature;

            draw.delete(id);

            if (isDefined(onDone) && typeof onDone === "function") {
                onDone();
            }
        },
        [draw, geoJsonFeature]
    );

    const resetFeature = useCallback(
        ({ skipPanelState } = { skipPanelState: false }) => {
            uniqueCachedFeatureId.current = null;
            setGeoJsonFeature(null);
            // deselect feature (unfortunately by deselecting all features, specific ids don't work)
            draw.changeMode("simple_select", { featureIds: [] });

            if (!skipPanelState) {
                setDrawModePanel(DRAW_MODE_PANEL_STATE.NONE);
            }
        },
        [draw]
    );

    const handleMapClick = useCallback(
        /**
         *  @param {maplibregl.MapMouseEvent} event
         */
        (event) => {
            const { point } = event;
            const boxAroundPoint = calculateBoundingBox(point, CLICK_BUFFER);

            const drawFeature = map
                .queryRenderedFeatures(boxAroundPoint)
                .filter(isDrawingFeature)
                .at(0);

            if (isDefined(drawFeature)) {
                const id = drawFeature.properties.id;
                if (uniqueCachedFeatureId.current === id) {
                    return;
                }

                uniqueCachedFeatureId.current = id;
                setGeoJsonFeature(getFeatureProperties(drawFeature));
                setDrawModePanel(DRAW_MODE_PANEL_STATE.FEATURE);
            } else {
                // only auto-deselect features when "clicking a feature away"
                if (uniqueCachedFeatureId.current !== null) {
                    resetFeature();
                }
            }
        },
        [draw]
    );

    const handleDrawDelete = useCallback(() => {
        resetFeature();
    }, [resetFeature]);

    // set or reset feature when clicked
    // register draw.delete handler to reset feature when trash icon is clicked
    useEffect(() => {
        if (isDefined(map)) {
            map.on("click", handleMapClick);
            map.on("draw.delete", handleDrawDelete);
            return () => {
                map.off("click", handleMapClick);
                map.off("draw.delete", handleDrawDelete);
            };
        }
    }, [map, handleMapClick]);

    // when another panel opens, clear the state
    useEffect(() => {
        if (
            uniqueCachedFeatureId.current !== null &&
            drawModePanel !== DRAW_MODE_PANEL_STATE.FEATURE
        ) {
            resetFeature({ skipPanelState: true });
        }
    }, [drawModePanel, resetFeature]);

    if (geoJsonFeature === null) {
        return null;
    }

    return {
        geoJsonFeature,
        saveFeature,
        deleteFeature,
        resetFeature,
    };
};

export default useGeoJsonFeatureDraw;
