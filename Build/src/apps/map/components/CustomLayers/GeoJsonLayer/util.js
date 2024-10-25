/*
 * Created by tom.schulze@pikobytes.de on 09.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

// eslint-disable-next-line no-unused-vars
import GeoJsonLayer from "./GeoJsonLayer";
import { GEOJSON_LAYER_TYPES, LAYER_DEFINITIONS } from "./constants.js";
import { MAP_LIBRE_METADATA } from "../constants";
import { MAP_OVERLAY_FILL_ID } from "@map/components/MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";

/**
 * Takes a GeoJsonLayer and creates the necessary maplibre-gl layers for it.
 *
 * @param {GeoJsonLayer} geoJsonLayer
 * @param {maplibregl.Map} map
 */
export const addGeoJsonLayers = (geoJsonLayer, map) => {
    const layer = geoJsonLayer;

    const applicationLayerId = layer.getId();
    const data = layer.getGeoJSON();

    const sourceType = layer.getType();

    map.addSource(applicationLayerId, {
        type: sourceType,
        data,
    });

    const beforeLayer =
        map.getLayer(MAP_OVERLAY_FILL_ID) !== undefined
            ? MAP_OVERLAY_FILL_ID
            : undefined;

    for (const key of Object.keys(GEOJSON_LAYER_TYPES)) {
        const layerType = GEOJSON_LAYER_TYPES[key];
        const layerId = `${applicationLayerId}-${layerType}`;
        map.addLayer(
            {
                id: layerId,
                source: applicationLayerId,
                metadata: {
                    [MAP_LIBRE_METADATA.id]: applicationLayerId,
                },
                ...LAYER_DEFINITIONS[layerType],
                layout: {
                    ...LAYER_DEFINITIONS[layerType].layout,
                    visibility: "visible",
                },
            },
            beforeLayer
        );

        geoJsonLayer.addMapLayer(layerId);
    }
};
