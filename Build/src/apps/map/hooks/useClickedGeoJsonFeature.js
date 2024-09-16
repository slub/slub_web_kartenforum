/*
 * Created by tom.schulze@pikobytes.de on 13.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useEffect, useCallback, useState } from "react";
import { LAYOUT_TYPES } from "../layouts/util";
import { MAP_LIBRE_METADATA } from "../components/MapWrapper/geojson/constants";
import { isDefined } from "../../../util/util";

const isApplicationFeature = (feature) =>
    isDefined(feature.layer.metadata?.[MAP_LIBRE_METADATA.id]);

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

    const handleMapClick = useCallback(
        /**
         *  @param {maplibregl.MapMouseEvent} event
         */
        (event) => {
            const feature = map
                .queryRenderedFeatures(event.point)
                .filter(isApplicationFeature)
                .at(0);

            if (isDefined(feature)) {
                setGeoJsonFeature(feature);
            } else {
                setGeoJsonFeature(null);
            }
        },
        [map]
    );

    useEffect(() => {
        if (isDefined(map) && layout === LAYOUT_TYPES.HORIZONTAL) {
            map.on("click", handleMapClick);

            return () => {
                map.un("click", handleMapClick);
            };
        }
    }, [map, layout, handleMapClick]);

    return { geoJsonFeature, setGeoJsonFeature };
}

export default useClickedGeoJsonFeature;
