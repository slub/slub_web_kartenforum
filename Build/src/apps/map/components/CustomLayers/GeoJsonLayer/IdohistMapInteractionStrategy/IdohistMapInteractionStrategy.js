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
    createIdohistHoverLayerConfig,
    createIdohistMarker,
    DATA_ATTR_VISIBILITY,
    FEATURE_PROPS_SYMBOL,
} from "./util";
import { MAP_OVERLAY_FILL_ID } from "@map/components/MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer";
import { VISIBILITY } from "../../constants";
import { FEATURE_PROPERTIES } from "@map/components/GeoJson/constants";

import "./IdohistMapInteractionStrategy.scss";
import { DEFAULT_OPACITY_VALUES } from "./constants";
import { MAPLIBRE_OPACITY_KEYS } from "../VkfMapInteractionStrategy/constants";

/**
 * Handles geojson that represents the IDOHIST specification.
 * The geojson is expected to be a FeatureCollection consisting of Point features only.
 *
 * Note: The layer management is expected to ignore IDOHIST layers.
 * VKF Layers are handled by the canvas, while the IDOHIST layer is a DOM layer.
 */
class IdohistMapInteractionStrategy extends AbstractMapInteractionStrategy {
    #markers = [];
    #sourceId = null;
    #isVisible = true;
    #opacity = 1;
    #mapLibreLayerIds = [];

    constructor(sourceId) {
        super();
        this.#sourceId = sourceId;
    }

    addLayerToMap(map, settings, geojson) {
        if (!isDefined(map)) {
            return;
        }

        const geoJsonHoverPolygons = {
            type: "FeatureCollection",
            features: [],
        };

        for (const feature of geojson.features) {
            if (feature.geometry.type !== "Point") {
                continue;
            }

            const marker = createIdohistMarker(feature, this.#sourceId);
            const hoverPolygonFeature = createFeatureFromHoverPolygon(feature);
            this.#markers.push(marker);
            geoJsonHoverPolygons.features.push(hoverPolygonFeature);
        }

        this.#markers.forEach((marker) => marker.addTo(map));

        map.addSource(this.#sourceId, {
            type: "geojson",
            data: geoJsonHoverPolygons,
        });

        // create the style layers that hold the hover polygon data or empty geojson
        // also needed as a dummy layer for layer management
        const beforeLayer =
            map.getLayer(MAP_OVERLAY_FILL_ID) !== undefined
                ? MAP_OVERLAY_FILL_ID
                : undefined;
        const layerConfig = createIdohistHoverLayerConfig(this.#sourceId);

        for (const [layerId, config] of Object.entries(layerConfig)) {
            map.addLayer(config, beforeLayer);
            this.#mapLibreLayerIds.push(layerId);
        }

        if (isDefined(settings)) {
            const { layerSettings } = settings;

            const opacity = layerSettings?.opacity ?? 1;
            const visibility = layerSettings?.visibility ?? "visible";

            // set visibility before opacity
            this.setVisibility(map, visibility);
            this.setOpacity(map, opacity);
        }
    }

    removeLayerFromMap(map) {
        this.#markers.forEach((marker) => marker.remove());
        this.#markers = [];

        for (const id of this.#mapLibreLayerIds) {
            map.removeLayer(id);
        }

        map.removeSource(this.#sourceId);
        this.#mapLibreLayerIds = [];
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
        if (visibility === VISIBILITY.VISIBLE) {
            for (const marker of this.#markers) {
                const element = marker.getElement();
                element.setAttribute(DATA_ATTR_VISIBILITY, VISIBILITY.VISIBLE);
                element.style.setProperty("display", "block");
            }

            this.#isVisible = true;
            // fire custom event, as visibility changes are not handled via maplibre layer methods
            map.fireVisibilityChanged(this.#sourceId, visibility);

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
        // VKF Layers are handled by the canvas, while the IDOHIST layer is a DOM layer.
        return;
    }

    setFilters(map, filterValues) {
        for (const marker of this.#markers) {
            const time = marker[FEATURE_PROPS_SYMBOL][FEATURE_PROPERTIES.time];
            const { timeExtent } = filterValues;

            if (timeExtent[0] * 1000 > time || timeExtent[1] * 1000 < time) {
                marker.remove();
                continue;
            }

            marker.addTo(map);
        }
    }

    resetFilters(map) {
        this.#markers.forEach((marker) => marker.addTo(map));
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
}

export default IdohistMapInteractionStrategy;
