/*
 * Created by tom.schulze@pikobytes.de on 13.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useEffect, useCallback, useState, useRef } from "react";
import { MAP_LIBRE_METADATA } from "@map/components/CustomLayers";
import { isDefined, translate } from "@util/util";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import {
    mapState,
    selectedGeoJsonFeatureIdentifierState,
    selectedLayersState,
} from "@map/atoms";

import { notificationState } from "@atoms";
import { FEATURE_PROPERTIES } from "@map/components/GeoJson/constants";

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

const getFeatureProperties = (maplibreFeature) => {
    const { type, id, geometry } = maplibreFeature;

    const time = JSON.parse(
        maplibreFeature.properties?.[FEATURE_PROPERTIES.time] ?? null
    );

    const properties = {
        ...maplibreFeature.properties,
        ...(time !== null && { time }),
    };

    return {
        id,
        geometry,
        properties,
        type,
    };
};

// https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md
const CLICK_BUFFER = 2;

/**
 * The hook API
 * @typedef {Object} useGeoJsonFeatureAPI
 * @property {object} geoJsonFeature - The currently selected geoJson feature from the GeoJsonFeatureCollection.
 * @property {function} resetFeature - Resets geoJsonFeature to null and clears the hook's internal state (e.g., to handle close logic)
 */

/**
 * Provides a stateful API to handle a selected geoJson feature. Intended for use with horizontal layout only.
 *
 * A feature can be selected via mouse click or externally by modifying
 * the selectedGeoJsonFeatureIdentifierState.
 *
 * @returns {...useGeoJsonFeatureAPI | null} {@link useGeoJsonFeatureAPI} or `null`
 */
function useGeoJsonFeature() {
    const setNotification = useSetRecoilState(notificationState);
    const map = useRecoilValue(mapState);
    const selectedLayers = useRecoilValue(selectedLayersState);
    const [
        selectedGeoJsonFeatureIdentifier,
        setSelectedGeoJsonFeatureIdentifier,
    ] = useRecoilState(selectedGeoJsonFeatureIdentifierState);

    const [geoJsonFeature, setGeoJsonFeature] = useState(null);

    // don't trigger a state update when same feature is clicked again
    const uniqueCachedFeatureId = useRef(null);

    const resetFeature = useCallback(() => {
        uniqueCachedFeatureId.current = null;
        setGeoJsonFeature(null);
        setSelectedGeoJsonFeatureIdentifier(null);
    }, []);

    const handleMapClick = useCallback(
        /**
         *  @param {maplibregl.MapMouseEvent} event
         */
        (event) => {
            const { point } = event;
            const boxAroundPoint = calculateBoundingBox(point, CLICK_BUFFER);

            const mapFeature = map
                .queryRenderedFeatures(boxAroundPoint)
                .filter(isApplicationFeature)
                .at(0);

            if (isDefined(mapFeature)) {
                const { id, source } = mapFeature;

                if (!isDefined(id)) {
                    setNotification({
                        id: "no-feature-id",
                        type: "warning",
                        text: translate("error-no-feature-id"),
                    });
                    return;
                }

                // only run if the feature is not already selected
                if (
                    naiveUniqueFeatureId(id, source) ===
                    uniqueCachedFeatureId.current
                ) {
                    return;
                }

                // set global state to handle css transitions
                setSelectedGeoJsonFeatureIdentifier({
                    featureId: id,
                    sourceId: source,
                });

                uniqueCachedFeatureId.current = naiveUniqueFeatureId(
                    id,
                    source
                );

                // we can use the maplibre feature directly, but we only need a subset of its properties.
                setGeoJsonFeature(getFeatureProperties(mapFeature));
            } else {
                resetFeature();
            }
        },
        []
    );

    // set feature when clicked
    useEffect(() => {
        if (isDefined(map)) {
            map.on("click", handleMapClick);
            return () => {
                map.off("click", handleMapClick);
            };
        }
    }, []);

    // set or reset feature externally by providing the feature identifier
    useEffect(() => {
        if (!isDefined(selectedGeoJsonFeatureIdentifier)) {
            // the feature has been reset externally
            if (isDefined(uniqueCachedFeatureId.current)) {
                resetFeature();
            }

            return;
        }

        if (isDefined(selectedLayers) && selectedLayers.length > 0) {
            const { featureId: id, sourceId: source } =
                selectedGeoJsonFeatureIdentifier;

            // only run if the feature is not already selected
            if (
                naiveUniqueFeatureId(id, source) ===
                uniqueCachedFeatureId.current
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
            setGeoJsonFeature(applicationFeature);
        }
    }, [selectedLayers, selectedGeoJsonFeatureIdentifier]);

    if (geoJsonFeature === null) {
        return null;
    }

    return {
        geoJsonFeature,
        resetFeature,
    };
}

export default useGeoJsonFeature;
