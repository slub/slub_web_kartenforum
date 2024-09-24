/*
 * Created by tom.schulze@pikobytes.de on 09.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

// @TODO find other import method for jsdoc, maybe typedefs?
// eslint-disable-next-line no-unused-vars
import { GeoJSONLayer } from "./GeoJSONLayer";
import {
    GEOJSON_LAYER_TYPES,
    MAP_LIBRE_METADATA,
    LAYER_DEFINITIONS,
} from "./constants";
import { MAP_OVERLAY_FILL_ID } from "../../MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";

/**
 * Takes a GeoJSONLayer and creates the necessary maplibre-gl layers for it.
 *
 * @param {GeoJSONLayer} geoJSONLayer
 * @param {maplibregl.Map} map
 */
export const addGeoJsonLayers = (geoJSONLayer, map) => {
    const layer = geoJSONLayer;

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

        geoJSONLayer.addMapLayer(layerId);
    }
};
