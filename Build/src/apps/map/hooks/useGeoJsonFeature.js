/*
 * Created by tom.schulze@pikobytes.de on 13.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useEffect, useCallback, useState, useRef } from "react";
import { LAYOUT_TYPES } from "@map/layouts/util";
import { MAP_LIBRE_METADATA } from "@map/components/CustomLayers";
import { isDefined } from "@util/util";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
    selectedGeoJsonFeatureIdentifierState,
    selectedLayersState,
    selectedGeoJsonLayerLastUpdatedState,
} from "@map/atoms";

const isApplicationFeature = (feature) =>
    isDefined(feature.layer.metadata?.[MAP_LIBRE_METADATA.id]);

const naiveUniqueFeatureId = (id, source) => `${id}-${source}`;

const calculateBoundingBox = (point, offset) => {
    const { x, y } = point;
    return [
        [x - offset, y - offset],
        [x + offset, y + offset],
    ];
};

/**
 * The hook properties
 * @typedef {Object} useGeoJsonFeatureProps
 * @property {maplibregl.Map} map - The MapLibre map instance
 * @property {LAYOUT_TYPES} layout - The application's current layout mode
 */

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
 * Provides a stateful API to handle the selected geoJson feature.
 *
 * A feature can be selected via mouse click or externally by modifying
 * the selectedGeoJsonFeatureIdentifierState.
 *
 * @param {...useGeoJsonFeatureProps} props {@link useGeoJsonFeatureProps}
 * @returns {...useGeoJsonFeatureAPI | null} {@link useGeoJsonFeatureAPI} or `null`
 */
function useGeoJsonFeature({ map, layout }) {
    const selectedLayers = useRecoilValue(selectedLayersState);
    const [
        selectedGeoJsonFeatureIdentifier,
        setSelectedGeoJsonFeatureIdentifier,
    ] = useRecoilState(selectedGeoJsonFeatureIdentifierState);
    const setSelectedGeoJsonLayerLastUpdated = useSetRecoilState(
        selectedGeoJsonLayerLastUpdatedState
    );

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
            const boxAroundPoint = calculateBoundingBox(point, 2);

            const mapFeature = map
                .queryRenderedFeatures(boxAroundPoint)
                .filter(isApplicationFeature)
                .at(0);

            if (isDefined(mapFeature)) {
                // don't use the map feature directly to streamline initialization logic
                const { id, source } = mapFeature;
                setFeatureIdentifier({ id, source });
            } else {
                resetFeature();
            }
        },
        []
    );

    // set or reset feature when clicked
    useEffect(() => {
        if (isDefined(map) && layout === LAYOUT_TYPES.HORIZONTAL) {
            map.on("click", handleMapClick);
            return () => {
                map.off("click", handleMapClick);
            };
        }
    }, [layout]);

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
        setSelectedGeoJsonFeatureIdentifier({
            featureId: id,
            sourceId: source,
        });
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
}

export default useGeoJsonFeature;
