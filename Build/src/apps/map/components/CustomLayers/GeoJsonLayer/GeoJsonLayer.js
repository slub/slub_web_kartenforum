/*
 * Created by tom.schulze@pikobytes.de on 11.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { ApplicationLayer } from "../ApplicationLayer";
import {
    MAPLIBRE_OPACITY_KEYS,
    GEOJSON_OPACITY_KEYS,
    layerHasOpacityProperty,
    DEFAULT_STYLE_VALUES,
} from "./constants";
import { isDefined } from "@util/util";
import {
    convertFeatureDiffPropertyForMapState,
    convertFeatureForMapState,
    convertFeatureForApplicationState,
    getLayerConfig,
    getTimeFilter,
} from "./util";
import { METADATA, LAYER_TYPES } from "../constants";
import { bbox } from "@turf/bbox";
import { MAP_OVERLAY_FILL_ID } from "@map/components/MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer";

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

class GeoJsonLayer extends ApplicationLayer {
    geoJSON = {};
    #mapLibreLayerIds = [];
    #defaultLayerFilters = {};

    constructor({ metadata, geometry, geoJSON }) {
        super({ metadata, geometry });
        this.geoJSON = geoJSON;

        this.#initialize();
    }

    #initialize() {
        // feature.id MUST be integer or string that is castable to integer
        // see: https://github.com/maplibre/maplibre-gl-js/discussions/3134
        // see: https://maplibre.org/maplibre-style-spec/expressions/#feature-state
        this.geoJSON.features = this.geoJSON.features.map((feature, idx) => {
            if (!Object.hasOwn(feature, "properties")) {
                feature.properties = {};
            }

            feature = convertFeatureForApplicationState(feature);

            return { ...feature, id: idx + 1 };
        });

        const bounds = this.geometry ? bbox(this.geometry) : bbox(this.geoJSON);
        this.metadata[METADATA.bounds] = bounds;

        this.metadata[METADATA.id] =
            this.metadata[METADATA.id] ?? crypto.randomUUID();
        this.metadata[METADATA.timePublished] = Date.now();
        this.metadata[METADATA.hasGeoReference] = true;
    }

    #registerEventHandlers(map) {
        for (const { id } of this.#getMapLibreLayers(map)) {
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

    addLayerToMap(map) {
        if (!isDefined(map)) {
            return;
        }

        const sourceId = this.getId();
        const data = GeoJsonLayer.#getGeoJsonMapState(this.geoJSON);

        const sourceType = this.getType();
        const layerConfig = getLayerConfig(sourceId);

        map.addSource(sourceId, {
            type: sourceType,
            data,
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

        this.#registerEventHandlers(map);
    }

    updateDataOnMap(map, sourceDiff) {
        if (!isDefined(map) || !isDefined(sourceDiff)) {
            return Promise.reject();
        }

        const sourceLayer = map.getSource(this.getId());
        const internalSourceDiff =
            GeoJsonLayer.#parseSourceDiffToMapState(sourceDiff);

        return sourceLayer
            .updateData(internalSourceDiff)
            .getData()
            .then((geoJSON) => {
                const convertedGeoJson =
                    GeoJsonLayer.#getGeoJsonApplicationState(geoJSON);
                this.setGeoJson(convertedGeoJson);
                return convertedGeoJson;
            });
    }

    removeFeatureFromMap(map, id) {
        const sourceLayer = map.getSource(this.getId());

        sourceLayer.updateData({ remove: [id] });
        this.removeFeature(id);
    }

    // needed for filtering on map
    static #getGeoJsonMapState(geoJson) {
        const clonedGeoJson = structuredClone(geoJson);
        const features = clonedGeoJson.features.map(convertFeatureForMapState);

        const internalGeoJson = { ...clonedGeoJson, features };
        return internalGeoJson;
    }

    static #getGeoJsonApplicationState(geoJson) {
        const clonedGeoJson = structuredClone(geoJson);
        const features = clonedGeoJson.features.map(
            convertFeatureForApplicationState
        );

        const internalGeoJson = { ...clonedGeoJson, features };
        return internalGeoJson;
    }

    static #parseSourceDiffToMapState(sourceDiff) {
        let add = sourceDiff.add ?? [];
        let update = sourceDiff.update ?? [];

        add = add.map(convertFeatureForMapState);
        update = update.map((featureDiff) => {
            let convertedProperties = featureDiff.addOrUpdateProperties ?? [];
            convertedProperties = convertedProperties.map(
                convertFeatureDiffPropertyForMapState
            );

            return {
                ...featureDiff,
                addOrUpdateProperties: convertedProperties,
            };
        });

        return { ...sourceDiff, add, update };
    }

    getGeoJson() {
        return this.geoJSON;
    }

    setGeoJson(geoJson) {
        this.geoJSON = geoJson;
    }

    getFeature(id) {
        const feature = this.geoJSON.features.find(
            (feature) => feature.id === id
        );

        if (!isDefined(feature)) {
            console.warn(`No feature found for id '${id}'`);
            return null;
        }

        return feature;
    }

    removeFeature(id) {
        const idx = this.geoJSON.features.findIndex(
            (feature) => feature.id === id
        );

        if (idx < 0) {
            console.warn(
                `Trying to remove a feature with non existing id '${id}'`
            );
            return;
        }

        this.geoJSON.features.splice(idx, 1);
    }

    setFeatureState(map, id, featureState) {
        if (!isDefined(map) || !isDefined(id) || !isDefined(featureState)) {
            return;
        }

        const source = this.getId();

        map.setFeatureState({ source, id }, featureState);
    }

    /**
     *
     * @param {maplibregl.Map} map
     */
    isDisplayedInMap(map) {
        return map.getSource(this.getId()) !== undefined;
    }

    /**
     *
     * @returns {LAYER_TYPES.GEOJSON}
     */
    getType() {
        return LAYER_TYPES.GEOJSON;
    }

    /**
     * Utility method to fetch the corresponding maplibre style layers.
     *
     * @protected
     * @param {maplibregl.Map} map
     * @returns {maplibregl.StyleLayer[]}
     */
    #getMapLibreLayers(map) {
        const mapLayers = this.#mapLibreLayerIds.map((layerId) => {
            return map.getLayer(layerId);
        });

        if (mapLayers[0] === undefined) {
            return [];
        }

        return mapLayers;
    }

    getMapLibreLayerId() {
        return this.#mapLibreLayerIds.length > 0
            ? this.#mapLibreLayerIds[0]
            : null;
    }

    removeMapLibreLayers(map) {
        if (!isDefined(map)) {
            return;
        }

        for (const { id } of this.#getMapLibreLayers(map)) {
            this.#unregisterEventHandlers(map, id);
            map.removeLayer(id);
        }
    }

    /**
     * All layers share the same opacity. The SYMBOL layer does not have an opacity value.
     * Cycle through all GeoJSON layers until a layer with an opacity property is found.
     *
     * @param {maplibregl.Map} map
     */
    getOpacity(map) {
        const mapLayers = this.#getMapLibreLayers(map);
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

    /**
     *
     *
     * @param {maplibregl.Map} map
     */
    setOpacity(map, opacity) {
        const mapLayers = this.#getMapLibreLayers(map);

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
        const mapLayers = this.#getMapLibreLayers(map);

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
        const mapLayers = this.#getMapLibreLayers(map);

        if (mapLayers.length === 0 || !isDefined(visibility)) {
            return;
        }

        for (const { id } of mapLayers) {
            map.setLayoutProperty(id, "visibility", visibility);
        }
    }

    move(map, beforeLayer) {
        const layers = this.#getMapLibreLayers(map);

        layers.forEach(({ id }) => {
            map.moveLayer(id, beforeLayer ?? MAP_OVERLAY_FILL_ID);
        });
    }

    moveToTop(map) {
        this.move(map, null);
    }

    /**
     * Sets the maplibregl map filter for each geojson layer.
     * @param {maplibregl.map} map
     * @param {object} filterValues filter values to build the filter expressions. Resets filter to default if undefined.
     * @returns
     */
    setFilters(map, filterValues) {
        const mapLayers = this.#getMapLibreLayers(map);

        if (mapLayers.length === 0) {
            return;
        }

        const timeExtent = filterValues?.timeExtent;
        const timeFilter = getTimeFilter(timeExtent);

        for (const mapLayer of mapLayers) {
            const { id } = mapLayer;

            const defaultFilter = this.#defaultLayerFilters[id];

            if (!isDefined(timeFilter) || timeFilter.length === 0) {
                map.setFilter(id, defaultFilter);
                continue;
            }

            const appliedFilter = ["all", defaultFilter, timeFilter];
            map.setFilter(id, appliedFilter);
        }
    }
}

export default GeoJsonLayer;
