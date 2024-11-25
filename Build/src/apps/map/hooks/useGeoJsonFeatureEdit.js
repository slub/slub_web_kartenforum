/*
 * Created by tom.schulze@pikobytes.de on 22.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

// NOTE THIS IS A DRAFT. it's the old functionality copied from the old geoJson hook. This needs to be adapted for the drawing layer.

import { useEffect, useCallback, useState, useRef } from "react";
import { MAP_LIBRE_METADATA } from "@map/components/CustomLayers";
import { isDefined, isString } from "@util/util";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
    selectedGeoJsonFeatureIdentifierState,
    selectedLayersState,
    selectedGeoJsonLayerLastUpdatedState,
    selectedGeoJsonLayerState,
    drawState,
    mapState,
} from "@map/atoms";

const isApplicationFeature = (feature) =>
    isDefined(feature.layer.metadata?.[MAP_LIBRE_METADATA.id]);

const isSelectableDrawingFeature = (feature) => {
    const { source } = feature;
    const isDrawingSource =
        source === "mapbox-gl-draw-cold" || source === "mapbox-gl-draw-hot";

    // mabox-draw assigns string ids to new features; cheaper than iterating over layer features
    // TODO DRAWING, how to treat newly added features? they need to be added to geojson layer when added to drawing layer
    const isNewlyDrawnFeature = isString(feature.properties?.id);

    return isDrawingSource && !isNewlyDrawnFeature;
};

const naiveUniqueFeatureId = (id, source) => `${id}-${source}`;

const calculateBoundingBox = (point, offset) => {
    const { x, y } = point;
    return [
        [x - offset, y - offset],
        [x + offset, y + offset],
    ];
};

const getFeatureIdentifier = (feature, layer, mode) => {
    let featureId = null;
    let sourceId = null;

    if (mode === MODE.STANDARD) {
        featureId = feature.id;
        sourceId = feature.source;
    } else if (mode === MODE.DRAW) {
        featureId = feature.properties?.id;
        sourceId = layer.getId();
    }

    return { id: featureId, source: sourceId };
};

// https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md
const CLICK_BUFFER = 2;

const MODE = {
    STANDARD: 1,
    DRAW: 2,
};

/**
 * The hook API
 * @typedef {Object} useGeoJsonFeatureAPI
 * @property {object} geoJsonFeature - The currently selected geoJson feature from the GeoJsonFeatureCollection.
 * @property {(onSuccess: function, onError: function) => {}} saveFeature - The save handler to persist the geojsonFeature to the application layer. Calls onSuccess, when done and onError for failures.
 * @property {(onDone: function) => {}} deleteFeature - The  delete handler to remove the geojsonFeature from the application layer. Calls onDone, when done.
 * @property {function} resetFeature - Resets geoJsonFeature to null and clears the hook's internal state.
 * @property {function} setFeatureState - Sets the feature state of the geojsonFeature on the map libre source layer.
 * @property {function} removeFeatureState - Removes the feature state of the geojsonFeature on the map libre source layer.
 */

/**
 * Provides a stateful API to handle the selected geoJson feature. Intended for use in horizontal layout only.
 *
 * A feature can be selected via mouse click or externally by modifying
 * the selectedGeoJsonFeatureIdentifierState.
 *
 * @returns {...useGeoJsonFeatureAPI | null} {@link useGeoJsonFeatureAPI} or `null`
 */

const useGeoJsonFeatureEdit = () => {
    const map = useRecoilValue(mapState);
    const selectedLayers = useRecoilValue(selectedLayersState);
    const [
        selectedGeoJsonFeatureIdentifier,
        setSelectedGeoJsonFeatureIdentifier,
    ] = useRecoilState(selectedGeoJsonFeatureIdentifierState);
    const setSelectedGeoJsonLayerLastUpdated = useSetRecoilState(
        selectedGeoJsonLayerLastUpdatedState
    );
    const { selectedLayer: selectedGeoJsonPanelLayer } = useRecoilValue(
        selectedGeoJsonLayerState
    );

    const draw = useRecoilValue(drawState);

    const [featureIdentifier, setFeatureIdentifier] = useState(null);
    const [geoJsonFeature, setGeoJsonFeature] = useState(null);
    const [selectedLayer, setSelectedLayer] = useState(null);

    // don't trigger a state update when same feature is clicked again
    const uniqueCachedFeatureId = useRef(null);
    // remember last clicked feature for click handler
    const storedFeatureIdentifier = useRef(null);

    const saveFeature = useCallback(
        ({ addOrUpdateProperties, removeProperties }, onSuccess, onError) => {
            const featureId = geoJsonFeature.id;
            const sourceDiff = {
                update: [
                    {
                        id: geoJsonFeature.id,
                        addOrUpdateProperties,
                        removeProperties,
                    },
                ],
            };

            selectedLayer
                .updateDataOnMap(map, sourceDiff)
                .then((geoJSON) => {
                    const idx = geoJSON.features.findIndex(
                        (feature) => feature.id === featureId
                    );

                    if (idx < 0) {
                        console.error(
                            `Cannot save feature with inexisting id '${featureId}'.`
                        );
                        return;
                    }

                    setGeoJsonFeature(geoJSON.features[idx]);
                    setSelectedGeoJsonLayerLastUpdated(Date.now());

                    if (
                        isDefined(onSuccess) &&
                        typeof onSuccess === "function"
                    ) {
                        onSuccess();
                    }
                })
                .catch(() => {
                    if (isDefined(onError) && typeof onError === "function") {
                        onError();
                    }
                });
        },
        [geoJsonFeature, selectedLayer]
    );

    const deleteFeature = useCallback(
        (onDone) => {
            const { id } = geoJsonFeature;
            selectedLayer.removeFeatureFromMap(map, id);
            setSelectedGeoJsonLayerLastUpdated(Date.now());
            if (isDefined(onDone) && typeof onDone === "function") {
                onDone();
            }
        },
        [geoJsonFeature, selectedLayer]
    );

    const setFeatureState = useCallback(
        (featureState) => {
            const id = geoJsonFeature.id;
            selectedLayer.setFeatureState(map, id, featureState);
        },
        [geoJsonFeature, selectedLayer]
    );

    const removeFeatureState = useCallback(() => {
        if (isDefined(storedFeatureIdentifier.current)) {
            map.removeFeatureState(storedFeatureIdentifier.current);
        }
    }, []);

    const resetFeature = useCallback(() => {
        uniqueCachedFeatureId.current = null;
        removeFeatureState();
        setGeoJsonFeature(null);
        setFeatureIdentifier(null);
        setSelectedGeoJsonFeatureIdentifier({
            featureId: null,
            sourceId: null,
        });
    }, []);

    const handleMapClick = useCallback(
        /**
         *  @param {maplibregl.MapMouseEvent} event
         */
        (event) => {
            const { point } = event;
            const boxAroundPoint = calculateBoundingBox(point, CLICK_BUFFER);
            const mode = isDefined(draw) ? MODE.DRAW : MODE.STANDARD;
            const dynamicFilter =
                mode === MODE.DRAW
                    ? isSelectableDrawingFeature
                    : isApplicationFeature;

            const mapFeature = map
                .queryRenderedFeatures(boxAroundPoint)
                .filter(dynamicFilter)
                .at(0);

            if (isDefined(mapFeature)) {
                // don't use the map feature directly to streamline initialization logic
                console.log(mapFeature);
                const { id, source } = getFeatureIdentifier(
                    mapFeature,
                    selectedGeoJsonPanelLayer,
                    mode
                );
                setFeatureIdentifier({ id, source });
                setSelectedGeoJsonFeatureIdentifier({
                    featureId: id,
                    sourceId: source,
                });
            } else {
                resetFeature();
            }
        },
        [draw, selectedGeoJsonPanelLayer]
    );

    // set or reset feature when clicked
    useEffect(() => {
        if (isDefined(map)) {
            map.on("click", handleMapClick);
            return () => {
                map.off("click", handleMapClick);
            };
        }
    }, [handleMapClick]);

    // set feature externally by providing the feature identifier
    useEffect(() => {
        if (
            isDefined(selectedGeoJsonFeatureIdentifier?.featureId) &&
            isDefined(selectedGeoJsonFeatureIdentifier?.sourceId) &&
            selectedLayers.length > 0
        ) {
            const { featureId: id, sourceId: source } =
                selectedGeoJsonFeatureIdentifier;

            setFeatureIdentifier({ id, source });
        }
    }, [selectedGeoJsonFeatureIdentifier]);

    // initialize state
    useEffect(() => {
        if (
            !isDefined(featureIdentifier?.source) ||
            !isDefined(featureIdentifier?.id) ||
            !isDefined(selectedLayers) ||
            selectedLayers?.length === 0
        ) {
            resetFeature();
            return;
        }

        const { id, source } = featureIdentifier;

        // only run if the feature is not already selected
        if (
            naiveUniqueFeatureId(id, source) === uniqueCachedFeatureId.current
        ) {
            return;
        }

        const selectedGeoJsonLayer = selectedLayers.find(
            (layer) => layer.getId() === source
        );

        if (!isDefined(selectedGeoJsonLayer)) {
            console.error(`No layer found with id '${source}'.`);

            resetFeature();
            return;
        }

        const applicationFeature = selectedGeoJsonLayer.getFeature(id);

        if (!isDefined(applicationFeature)) {
            console.error(`No feature found with id '${id}'.`);

            resetFeature();
            return;
        }

        uniqueCachedFeatureId.current = naiveUniqueFeatureId(id, source);
        storedFeatureIdentifier.current = { id, source };
        setSelectedLayer(selectedGeoJsonLayer);
        setGeoJsonFeature(applicationFeature);
    }, [featureIdentifier, selectedLayers]);

    if (geoJsonFeature === null) {
        return null;
    }

    return {
        geoJsonFeature,
        saveFeature,
        deleteFeature,
        resetFeature,
        setFeatureState,
        removeFeatureState,
    };
};

export default useGeoJsonFeatureEdit;
