/*
 * Created by tom.schulze@pikobytes.de on 09.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

// @TODO find other import method for jsdoc, maybe typedefs?
// eslint-disable-next-line no-unused-vars
import { GeoJSONLayer } from "./GeoJSONLayer";
import { GEOJSON_LAYER_TYPES, MAP_LIBRE_METADATA } from "./constants";
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

    //@TODO: Add defaults
    //@TODO: Add filters to layer, to only draw their respective geometry types
    const options = {
        [GEOJSON_LAYER_TYPES.SYMBOL]: {
            type: "symbol",
            layout: {
                "icon-image": ["get", "marker"],
                "icon-size": 1,
            },
        },
        [GEOJSON_LAYER_TYPES.LINE]: {
            type: "line",
            paint: {
                "line-color": ["get", "stroke"],
                "line-width": ["get", "stroke-width"],
                "line-opacity": ["get", "stroke-opacity"],
            },
            filter: ["==", "$type", "LineString"],
        },
        [GEOJSON_LAYER_TYPES.OUTLINE]: {
            type: "line",
            paint: {
                "line-color": ["get", "stroke"],
                "line-width": ["get", "stroke-width"],
                "line-opacity": ["get", "stroke-opacity"],
            },
            filter: ["!=", "$type", "LineString"],
        },
        [GEOJSON_LAYER_TYPES.FILL]: {
            type: "fill",
            paint: {
                "fill-color": ["get", "fill"],
                "fill-opacity": ["get", "fill-opacity"],
            },
            filter: ["!=", "$type", "LineString"],
        },
    };

    map.addSource(applicationLayerId, {
        type: sourceType,
        data,
    });

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
                ...options[layerType],
                layout: {
                    ...options[layerType].layout,
                    visibility: "visible",
                },
            },
            MAP_OVERLAY_FILL_ID
        );

        geoJSONLayer.addMapLayer(layerId);
    }
};
