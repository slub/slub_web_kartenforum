/*
 * Created by tom.schulze@pikobytes.de on 09.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined } from "../../../../../util/util";

/**
 * Takes a XXXdocumentXXX and creates the necessary maplibre-gl layers for it.
 *
 * @param {object} selectedFeature
 * @param {maplibregl.Map} map
 */
export const addGeoJsonLayers = (selectedFeature, map) => {
    const { feature } = selectedFeature;
    const { id: sourceId, data } = feature;
    //@TODO GeoJSON - implement one layer for each geojson feature type and style w/ filters
    //@TODO implement layers statically
    // extract all geometry types and create one layer for each geometry type
    // how to handle geometry collection?

    //@TODO layerId is relevant for the isDisplayedInMap check
    //@TODO GeoJSON - add default marker images to map
    const layerId = sourceId;
    const sourceType = "geojson";

    const metadata = (layerType) => {
        const typedLayerId = `${layerId}-${layerType}`;
        return {
            "vkf:id": isDefined(layerId) ? typedLayerId : undefined,
            "vkf:time_published": feature.time_changed,
            "vkf:title": feature.title ?? undefined,
            "vkf:thumb_url": feature.thumb_url ?? undefined,
            "vkf:allowUseInLayerManagement": true,
            "vkf:type": sourceType,
            //@TODO GeoJSON - implement bounds
            "vkf:bounds": undefined,
        };
    };

    map.addSource(sourceId, { type: sourceType, data });

    const symbolOptions = {
        layout: {
            "icon-image": ["get", "marker"],
            "icon-size": 1,
        },
        type: "symbol",
    };

    const lineOptions = {
        type: "line",
        paint: {
            "line-color": ["get", "stroke"],
            "line-width": ["get", "stroke-width"],
            "line-opacity": ["get", "stroke-opacity"],
        },
    };

    const fillOptions = {
        type: "fill",
        paint: {
            "fill-color": ["get", "fill"],
            "fill-opacity": ["get", "fill-opacity"],
        },
    };

    const outlineOptions = {
        type: "line",
        paint: {
            "line-color": ["get", "stroke"],
            "line-width": ["get", "stroke-width"],
            "line-opacity": ["get", "stroke-opacity"],
        },
    };

    map.addLayer({
        id: `${layerId}-symbol`,
        source: sourceId,
        metadata: metadata("symbol"),
        ...symbolOptions,
    });

    map.addLayer({
        id: `${layerId}-line`,
        source: sourceId,
        metadata: metadata("line"),
        ...lineOptions,
    });

    map.addLayer({
        id: `${layerId}-fill`,
        source: sourceId,
        metadata: metadata("fill"),
        ...fillOptions,
    });

    map.addLayer({
        id: `${layerId}-outline`,
        source: sourceId,
        metadata: metadata("outline"),
        ...outlineOptions,
    });
};
