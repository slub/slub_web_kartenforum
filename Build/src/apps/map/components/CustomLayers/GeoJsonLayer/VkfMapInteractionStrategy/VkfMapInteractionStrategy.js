/*
 * Created by tom.schulze@pikobytes.de on 20.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined } from "@util/util";
import { createLayerConfig } from "./util";
import { MAP_OVERLAY_FILL_ID } from "@map/components/MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer";
import {
    DEFAULT_STYLE_VALUES,
    GEOJSON_OPACITY_KEYS,
    layerHasOpacityProperty,
    MAPLIBRE_OPACITY_KEYS,
} from "./constants";
import { getTimeFilter } from "../util";
import AbstractMapInteractionStrategy from "../AbstractMapInteractionStrategy";

// NOTE mousemove event handler could be replaced with mouseenter if the polygon outline should not trigger an event
const eventHandlers = [
    {
        type: "mousemove",
        handler: (e) => (e.target.getCanvas().style.cursor = "pointer"),
    },
    {
        type: "mouseleave",
        handler: (e) => (e.target.getCanvas().style.cursor = ""),
    },
];

/**
 * The VkfMapInteractionStrategy handles geojson that complies with the VKF GeoJson specification.
 *
 * 4 style layers are used to represent point, line and polygon features. Polygon features can have an outline.
 */
class VkfMapInteractionStrategy extends AbstractMapInteractionStrategy {
    #sourceId = null;
    #mapLibreLayerIds = [];
    #defaultLayerFilters = {};

    constructor(sourceId) {
        super();
        this.#sourceId = sourceId;
    }

    #registerEventHandlers(map) {
        for (const { id } of this.#getLayers(map)) {
            for (const { type, handler } of eventHandlers) {
                map.on(type, id, handler);
            }
        }
    }

    #unregisterEventHandlers(map, layerId) {
        for (const { type, handler } of eventHandlers) {
            map.off(type, layerId, handler);
        }
    }

    addLayerToMap(map, settings, geoJson) {
        if (!isDefined(map)) {
            return;
        }

        const sourceId = this.#sourceId;
        const layerConfig = createLayerConfig(sourceId);

        map.addSource(sourceId, {
            type: "geojson",
            data: geoJson,
        });

        const beforeLayer =
            map.getLayer(MAP_OVERLAY_FILL_ID) !== undefined
                ? MAP_OVERLAY_FILL_ID
                : undefined;

        for (const [layerId, config] of Object.entries(layerConfig)) {
            map.addLayer(config, beforeLayer);
            this.#mapLibreLayerIds.push(layerId);
            this.#defaultLayerFilters[layerId] = config.filter;
        }

        if (isDefined(settings)) {
            const { layerSettings } = settings;

            const opacity = layerSettings?.opacity ?? 1;
            const visibility = layerSettings?.visibility ?? "visible";

            this.setOpacity(map, opacity);
            this.setVisibility(map, visibility);
        }

        this.#registerEventHandlers(map);
    }

    removeLayerFromMap(map) {
        if (!isDefined(map)) {
            return;
        }

        for (const { id } of this.#getLayers(map)) {
            this.#unregisterEventHandlers(map, id);
            map.removeLayer(id);
        }

        map.removeSource(this.#sourceId);
        this.#mapLibreLayerIds = [];
    }

    /**
     * Sets new data to the maplibregl's source layer calling sourceLayer.setData.
     *
     * @param {maplibregl.Map} map
     * @param {object} geoJson Feature properties are expected to represent application state
     * @returns
     */
    setDataOnMap(map, geoJson) {
        const sourceLayer = map.getSource(this.#sourceId);

        if (!isDefined(sourceLayer)) {
            console.error(
                "Cannot update geojson on map. Source layer not found"
            );
            return;
        }

        sourceLayer.setData(geoJson);
    }

    /**
     * All layers share the same opacity. The SYMBOL layer does not have an opacity value.
     * Cycle through all GeoJSON layers until a layer with an opacity property is found.
     *
     * @param {maplibregl.Map} map
     */
    getOpacity(map) {
        const mapLayers = this.#getLayers(map);
        let opacityExpression = 1;
        const fallbackOpacity = 1;

        if (mapLayers.length === 0) {
            return null;
        }

        for (const { id, type } of mapLayers) {
            if (!layerHasOpacityProperty(type)) {
                continue;
            }

            const opacityKey = MAPLIBRE_OPACITY_KEYS[type];
            opacityExpression = map.getPaintProperty(id, opacityKey);
            break;
        }

        if (typeof opacityExpression === "number") {
            return opacityExpression;
        }

        if (Array.isArray(opacityExpression) && opacityExpression.length > 0) {
            if (opacityExpression[0] === "*") {
                return opacityExpression[2];
            }

            if (opacityExpression[0] === "coalesce") {
                return opacityExpression[3];
            }
        }

        return fallbackOpacity;
    }

    setOpacity(map, opacity) {
        const mapLayers = this.#getLayers(map);

        if (mapLayers.length === 0 || !isDefined(opacity)) {
            return;
        }

        for (const { id, type } of mapLayers) {
            if (!layerHasOpacityProperty(type)) {
                continue;
            }

            const DEFAULT_OPACITY = DEFAULT_STYLE_VALUES[type].OPACITY;

            const opacityKey = MAPLIBRE_OPACITY_KEYS[type];
            const propertyOpacityKey = GEOJSON_OPACITY_KEYS[type];
            map.setPaintProperty(id, opacityKey, [
                "*",
                [
                    "coalesce",
                    ["feature-state", propertyOpacityKey],
                    ["get", propertyOpacityKey],
                    DEFAULT_OPACITY,
                ],
                opacity,
            ]);
        }
    }

    /**
     * All layers share the same visiblity. Only the first map layer is considered for the visibility status.
     *
     * @param {maplibregl.Map} map
     */
    isVisible(map) {
        const mapLayers = this.#getLayers(map);

        if (mapLayers.length === 0) {
            return false;
        }

        const visibility = map.getLayoutProperty(mapLayers[0].id, "visibility");

        return visibility === "visible";
    }

    /**
     * @param {maplibregl.Map} map
     * @param {"visible" | "none"} visiblity
     */
    setVisibility(map, visibility) {
        const mapLayers = this.#getLayers(map);

        if (mapLayers.length === 0 || !isDefined(visibility)) {
            return;
        }

        for (const { id } of mapLayers) {
            map.setLayoutProperty(id, "visibility", visibility);
        }
    }

    /**
     *
     * @param {maplibregl.Map} map
     */
    isDisplayedInMap(map) {
        return map.getSource(this.#sourceId) !== undefined;
    }

    getLayerId() {
        return this.#mapLibreLayerIds.length > 0
            ? this.#mapLibreLayerIds[0]
            : null;
    }

    /**
     * Utility method to fetch the corresponding maplibre style layers.
     *
     * @protected
     * @param {maplibregl.Map} map
     * @returns {maplibregl.StyleLayer[]}
     */
    #getLayers(map) {
        const mapLayers = this.#mapLibreLayerIds.map((layerId) => {
            return map.getLayer(layerId);
        });

        if (mapLayers[0] === undefined) {
            return [];
        }

        return mapLayers;
    }

    move(map, beforeLayer) {
        const layers = this.#getLayers(map);

        let layoutAdjustedBeforeLayer = beforeLayer;

        // there is no overlay layer in vertical layout
        if (!isDefined(beforeLayer)) {
            if (isDefined(map.getLayer(MAP_OVERLAY_FILL_ID))) {
                layoutAdjustedBeforeLayer = MAP_OVERLAY_FILL_ID;
            } else {
                layoutAdjustedBeforeLayer = null;
            }
        }

        layers.forEach(({ id }) => {
            map.moveLayer(id, layoutAdjustedBeforeLayer);
        });
    }

    setFilters(map, filterValues) {
        const mapLayers = this.#getLayers(map);

        if (mapLayers.length === 0) {
            return;
        }

        const timeExtent = filterValues?.timeExtent;
        const timeFilter = getTimeFilter(timeExtent);

        for (const mapLayer of mapLayers) {
            const { id } = mapLayer;
            const defaultFilter = this.#defaultLayerFilters[id];
            const newFilters = ["all", defaultFilter];

            if (isDefined(timeFilter) && timeFilter.length > 0) {
                newFilters.push(timeFilter);
            }

            map.setFilter(id, newFilters);
        }
    }

    resetFilters(map) {
        const mapLayers = this.#getLayers(map);

        if (mapLayers.length === 0) {
            return;
        }

        for (const mapLayer of mapLayers) {
            const { id } = mapLayer;
            const defaultFilter = this.#defaultLayerFilters[id];

            map.setFilter(id, defaultFilter);
        }
    }
}

export default VkfMapInteractionStrategy;
