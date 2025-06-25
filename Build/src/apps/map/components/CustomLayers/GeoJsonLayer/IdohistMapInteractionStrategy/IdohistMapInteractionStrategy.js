/*
 * Created by tom.schulze@pikobytes.de on 21.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined } from "@util/util";
import AbstractMapInteractionStrategy from "../AbstractMapInteractionStrategy";
import {
    createFeatureFromHoverPolygon,
    createIdohistLayerConfig,
    createIdohistMarker,
    DATA_ATTR_VISIBILITY,
    FEATURE_PROPS_SYMBOL,
} from "./util";
import { MAP_OVERLAY_FILL_ID } from "@map/components/MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer";
import { VISIBILITY } from "../../constants";
import { FEATURE_PROPERTIES } from "@map/components/GeoJson/constants";

import {
    DEFAULT_OPACITY_VALUES,
    IDOHIST_HOVER_LAYER_DEFINITIONS,
    IDOHIST_LAYER_DEFINITIONS,
} from "./constants";
import { MAPLIBRE_OPACITY_KEYS } from "../VkfMapInteractionStrategy/constants";

import "./IdohistMapInteractionStrategy.scss";
import { getTimeFilter } from "../util";

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

const createMarkersAndHoverPolygons = (
    geoJson,
    { sourceId, sourceIdHover }
) => {
    const geoJsonHoverPolygons = {
        type: "FeatureCollection",
        features: [],
    };

    const markers = [];

    for (const feature of geoJson.features) {
        if (feature.geometry.type !== "Point") {
            continue;
        }

        const marker = createIdohistMarker(feature, {
            sourceIdHover,
            sourceId,
        });
        markers.push(marker);

        const hoverPolygonFeature = createFeatureFromHoverPolygon(feature);
        geoJsonHoverPolygons.features.push(hoverPolygonFeature);
    }

    return { markers, geoJsonHoverPolygons };
};

/**
 * Handles geojson that represents the IDOHIST specification.
 * The geojson is expected to be a FeatureCollection consisting of Point features only.
 *
 * Note: The layer management is expected to ignore IDOHIST layers.
 * VKF Layers are handled by the canvas, while the IDOHIST layer is a DOM/canvas layer.
 */
class IdohistMapInteractionStrategy extends AbstractMapInteractionStrategy {
    #markers = [];
    #sourceId = null;
    #sourceIdHover = null;
    #isVisible = true;
    #opacity = 1;
    #mapLibreLayerIds = [];
    #defaultLayerFilters = {};

    constructor(sourceId) {
        super();
        this.#sourceId = sourceId;
        this.#sourceIdHover = `${sourceId}-hover`;
    }

    addLayerToMap(map, settings, geojson) {
        if (!isDefined(map)) {
            return;
        }

        const { markers, geoJsonHoverPolygons } = createMarkersAndHoverPolygons(
            geojson,
            { sourceId: this.#sourceId, sourceIdHover: this.#sourceIdHover }
        );

        this.#markers = markers;
        this.#markers.forEach((marker) => marker.addTo(map));

        const beforeLayer =
            map.getLayer(MAP_OVERLAY_FILL_ID) !== undefined
                ? MAP_OVERLAY_FILL_ID
                : undefined;

        const sources = [
            {
                sourceId: this.#sourceId,
                definition: IDOHIST_LAYER_DEFINITIONS,
                data: geojson,
                hasPopup: true,
            },
            {
                sourceId: this.#sourceIdHover,
                definition: IDOHIST_HOVER_LAYER_DEFINITIONS,
                data: geoJsonHoverPolygons,
                hasPopup: false,
            },
        ];

        for (const { sourceId, definition, data, hasPopup } of sources) {
            map.addSource(sourceId, {
                type: "geojson",
                data,
            });

            const layerConfig = createIdohistLayerConfig(
                sourceId,
                definition,
                hasPopup
            );

            for (const [layerId, config] of Object.entries(layerConfig)) {
                map.addLayer(config, beforeLayer);
                this.#mapLibreLayerIds.push(layerId);
                this.#defaultLayerFilters[layerId] = config.filter;
            }
        }

        if (isDefined(settings)) {
            const { layerSettings } = settings;

            const opacity = layerSettings?.opacity ?? 1;
            const visibility = layerSettings?.visibility ?? "visible";

            // set visibility before opacity
            this.setVisibility(map, visibility);
            this.setOpacity(map, opacity);
        }

        this.#registerEventHandlers(map);
    }

    removeLayerFromMap(map) {
        this.#markers.forEach((marker) => marker.remove());
        this.#markers = [];

        for (const id of this.#mapLibreLayerIds) {
            this.#unregisterEventHandlers(map, id);
            map.removeLayer(id);
        }

        map.removeSource(this.#sourceId);
        map.removeSource(this.#sourceIdHover);
        this.#mapLibreLayerIds = [];
    }

    setDataOnMap(map, geoJson) {
        const { markers, geoJsonHoverPolygons } = createMarkersAndHoverPolygons(
            geoJson,
            { sourceId: this.#sourceId, sourceIdHover: this.#sourceIdHover }
        );

        this.#markers.forEach((marker) => marker.remove());
        this.#markers = markers;
        this.#markers.forEach((marker) => marker.addTo(map));

        const sourceLayer = map.getSource(this.#sourceId);
        const sourceLayerHover = map.getSource(this.#sourceIdHover);

        if (!isDefined(sourceLayer) || !isDefined(sourceLayerHover)) {
            console.error(
                "Cannot update geojson on map. Source layer not found"
            );
            return;
        }

        sourceLayer.setData(geoJson);
        sourceLayerHover.setData(geoJsonHoverPolygons);
    }

    getOpacity() {
        return this.#opacity;
    }

    setOpacity(map, opacity) {
        if (!isDefined(opacity)) {
            return;
        }

        this.#opacity = opacity;
        this.#markers.forEach((marker) => marker.setOpacity(opacity));

        // set opacity of hover polygon layers
        const mapLayers = this.#getLayers(map);
        for (const { id, type } of mapLayers) {
            const DEFAULT_OPACITY = DEFAULT_OPACITY_VALUES[type];

            const opacityKey = MAPLIBRE_OPACITY_KEYS[type];

            map.setPaintProperty(id, opacityKey, [
                "*",
                DEFAULT_OPACITY,
                opacity,
            ]);
        }
    }

    isVisible() {
        if (this.#markers.length === 0) {
            return false;
        }

        return this.#isVisible;
    }

    setVisibility(map, visibility) {
        const mapLayers = this.#getLayers(map);

        if (mapLayers.length === 0 || !isDefined(visibility)) {
            return;
        }

        for (const { id } of mapLayers) {
            map.setLayoutProperty(id, "visibility", visibility);
        }

        if (visibility === VISIBILITY.VISIBLE) {
            for (const marker of this.#markers) {
                const element = marker.getElement();
                element.setAttribute(DATA_ATTR_VISIBILITY, VISIBILITY.VISIBLE);
                element.style.setProperty("display", "block");
            }

            this.#isVisible = true;
            // fire custom event, as visibility changes are not handled via maplibre layer methods
            map.fireVisibilityChanged(this.#sourceId, visibility);
            map.fireVisibilityChanged(this.#sourceIdHover, visibility);

            return;
        }

        if (visibility === VISIBILITY.NONE) {
            for (const marker of this.#markers) {
                const element = marker.getElement();
                element.setAttribute(DATA_ATTR_VISIBILITY, VISIBILITY.NONE);
                element.style.setProperty("display", "none");
            }

            this.#isVisible = false;
            // fire custom event, as visibility changes are not handled via maplibre layer methods
            map.fireVisibilityChanged(this.#sourceId, visibility);
            map.fireVisibilityChanged(this.#sourceIdHover, visibility);
            return;
        }
    }

    isDisplayedInMap() {
        return this.#markers.length > 0;
    }

    getLayerId() {
        return this.#mapLibreLayerIds.length > 0
            ? this.#mapLibreLayerIds[0]
            : null;
    }

    move() {
        // The layer management is expected to ignore idohist layers.
        // VKF Layers are handled by the canvas, while the IDOHIST layer is a DOM/canvas layer.
        return;
    }

    setFilters(map, filterValues) {
        const timeExtent = filterValues?.timeExtent;
        const timeFilter = getTimeFilter(timeExtent);
        const mapLayers = this.#getLayers(map);

        for (const mapLayer of mapLayers) {
            const { id } = mapLayer;
            const defaultFilter = this.#defaultLayerFilters[id];
            const newFilters = ["all", defaultFilter];

            if (isDefined(timeFilter) && timeFilter.length > 0) {
                newFilters.push(timeFilter);
            }

            map.setFilter(id, newFilters);
        }

        for (const marker of this.#markers) {
            const [start, end] =
                marker[FEATURE_PROPS_SYMBOL][FEATURE_PROPERTIES.time];
            const { timeExtent } = filterValues;

            // if time ranges overlap re-add the marker to the map
            if (start <= timeExtent[1] * 1000 && end >= timeExtent[0] * 1000) {
                marker.addTo(map);
            } else {
                marker.remove();
            }
        }
    }

    resetFilters(map) {
        const mapLayers = this.#getLayers(map);

        this.#markers.forEach((marker) => marker.addTo(map));

        for (const mapLayer of mapLayers) {
            const { id } = mapLayer;
            const defaultFilter = this.#defaultLayerFilters[id];

            map.setFilter(id, defaultFilter);
        }
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
}

export default IdohistMapInteractionStrategy;
