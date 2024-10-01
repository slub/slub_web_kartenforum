/*
 * Created by tom.schulze@pikobytes.de on 13.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useEffect, useCallback, useState, useRef } from "react";
import { LAYOUT_TYPES } from "../layouts/util";
import { MAP_LIBRE_METADATA } from "../components/CustomLayers";
import { isDefined } from "../../../util/util";

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
 * @typedef {Object} useClickGeoJsonFeatureProps
 * @property {maplibregl.Map} map - The MapLibre map instance
 * @property {LAYOUT_TYPES} layout - The application's current layout mode
 */

/**
 * Returns the top most application geojson feature on map click. Returns `null` if no feature exists at the mouse pointer coordinates.
 *
 * @param {...useClickGeoJsonFeatureProps} props {@link useClickGeoJsonFeatureProps}
 * @returns
 */
function useClickedGeoJsonFeature({ map, layout }) {
    const [geoJsonFeature, setGeoJsonFeature] = useState(null);
    const [sourceId, setSourceId] = useState(null);

    const uniqueCachedFeatureId = useRef(null);
    const storedRemovalOptions = useRef(null);

    const removeFeatureState = useCallback(() => {
        if (isDefined(storedRemovalOptions.current)) {
            map.removeFeatureState(storedRemovalOptions.current);
        }
    }, [map]);

    const resetClickedFeature = useCallback(() => {
        uniqueCachedFeatureId.current = null;
        removeFeatureState();
        setGeoJsonFeature(null);
        setSourceId(null);
    }, [setSourceId, setGeoJsonFeature]);

    const handleMapClick = useCallback(
        /**
         *  @param {maplibregl.MapMouseEvent} event
         */
        (event) => {
            const { point } = event;
            const boxAroundPoint = calculateBoundingBox(point, 2);

            const feature = map
                .queryRenderedFeatures(boxAroundPoint)
                .filter(isApplicationFeature)
                .at(0);

            if (isDefined(feature)) {
                const { id, source } = feature;
                if (
                    uniqueCachedFeatureId?.current ===
                    naiveUniqueFeatureId(id, source)
                ) {
                    return;
                }

                setGeoJsonFeature(feature);
                setSourceId(source);
                uniqueCachedFeatureId.current = naiveUniqueFeatureId(
                    id,
                    source
                );
                storedRemovalOptions.current = { id, source };
            } else {
                resetClickedFeature();
            }
        },
        [map]
    );

    useEffect(() => {
        if (isDefined(map) && layout === LAYOUT_TYPES.HORIZONTAL) {
            map.on("click", handleMapClick);

            return () => {
                map.off("click", handleMapClick);
            };
        }
    }, [map, layout, handleMapClick]);

    return {
        geoJsonFeature,
        setGeoJsonFeature,
        sourceId,
        resetClickedFeature,
        removeFeatureState,
    };
}

export default useClickedGeoJsonFeature;
