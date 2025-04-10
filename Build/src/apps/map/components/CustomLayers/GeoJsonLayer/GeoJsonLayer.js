/*
 * Created by tom.schulze@pikobytes.de on 11.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { ApplicationLayer } from "../ApplicationLayer";
import {
    DEFAULT_STYLE_VALUES,
    GEOJSON_OPACITY_KEYS,
    layerHasOpacityProperty,
    MAPLIBRE_OPACITY_KEYS,
} from "./constants";
import { isDefined } from "@util/util";
import {
    boundsToPolygon,
    convertFeatureForApplicationState,
    convertFeatureForPersistenceState,
    getLayerConfig,
    getTimeFilter,
} from "./util";
import { LAYER_TYPES, METADATA } from "../constants";
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

/**
 * Layer settings for initializing a layer e.g. from local storage or map views.
 * @typedef {object} LayerLoadSettings
 * @property {string} visibility
 * @property {number} opacity
 */

/**
 * The GeoJsonLayer params
 * @typedef {Object} GeoJsonLayerParams
 * @property {object} metadata - The GeoJsonLayer metadata object
 * @property {object} geometry - The geometry object
 * @property {object} geoJson - The geojson object representing either the persistence state (VKF specs) or the application state
 */

class GeoJsonLayer extends ApplicationLayer {
    static #isInternalConstructing = false;
    geoJSON = {};
    #mapLibreLayerIds = [];
    #defaultLayerFilters = {};

    /**
     * Private constructor. Use GeoJsonLayer.fromPersistence() or GeoJsonLayer.fromApplication() to create an instance.
     * @param {GeoJsonLayerParams} parameters
     * @private
     */
    constructor({ metadata, geometry, geoJson }) {
        if (!GeoJsonLayer.#isInternalConstructing) {
            throw new TypeError(
                "Constructor is private. Use GeoJsonLayer.fromApplication() or GeoJsonLayer.fromPersistence() instead."
            );
        }
        GeoJsonLayer.#isInternalConstructing = false;
        super({ metadata, geometry });
        this.#initialize(geoJson);
    }

    /**
     * Initializes a new GeoJsonLayer. The geoJson is expected to be in application state and passed on as is.
     * Use this method when operating with data from whithin the application boundaries.
     * To initialize a new GeoJsonLayer instance from persistence state use GeoJsonLayer.fromPersistence().
     *
     * Note: Feature ids set in this class are not stable. Stable feature ids are expected to be set in the geojson.
     *
     * @param {GeoJsonLayerParams} params
     */
    static fromApplication(params) {
        GeoJsonLayer.#isInternalConstructing = true;
        return new GeoJsonLayer(params);
    }

    /**
     * Initializes a new GeoJsonLayer. The geoJson is converted from persistence to application state.
     * Use this method when the data is crossing the application boundary.
     * To initialize a new GeoJsonLayer instance from application state use GeoJsonLayer.fromApplication().
     *
     * Note: Feature ids set in this class are not stable. Stable feature ids are expected to be set in the geojson.
     *
     * @param {GeoJsonLayerParams} params
     */
    static fromPersistence({ metadata, geometry, geoJson }) {
        GeoJsonLayer.#isInternalConstructing = true;
        const features = geoJson.features.map(
            convertFeatureForApplicationState
        );

        const preparedGeoJson = { ...geoJson, features };

        return new GeoJsonLayer({
            metadata,
            geometry,
            geoJson: preparedGeoJson,
        });
    }

    #initialize(geoJson) {
        this.setGeoJson(geoJson);

        const bounds = this.geometry ? bbox(this.geometry) : bbox(this.geoJSON);
        this.metadata[METADATA.bounds] = bounds;

        this.metadata[METADATA.id] =
            this.metadata[METADATA.id] ?? crypto.randomUUID();
        this.metadata[METADATA.timePublished] =
            this.metadata[METADATA.timePublished] ?? new Date().getFullYear();
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

    /**
     *
     * @param {maplibregl.Map} map
     * @param {{layerSettings: LayerLoadSettings}} settings
     * @returns
     */
    addLayerToMap(map, settings) {
        if (!isDefined(map)) {
            return;
        }

        const sourceId = this.getId();
        const data = this.getGeoJson();
        const layerConfig = getLayerConfig(sourceId);

        map.addSource(sourceId, {
            type: "geojson",
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

        if (isDefined(settings)) {
            const { layerSettings } = settings;

            const opacity = layerSettings?.opacity ?? 1;
            const visibility = layerSettings?.visibility ?? "visible";

            this.setOpacity(map, opacity);
            this.setVisibility(map, visibility);
        }

        this.#registerEventHandlers(map);
    }

    /**
     * Updates geojson on map using maplibre source diffs. The sourceDiff must represent the application state.
     *
     * @param {maplibregl.Map} map The maplibregl map instance
     * @param {object} sourceDiff The maplibregl source diff (expected to represent application state)
     * @returns {Promise}
     */
    updateDataOnMap(map, sourceDiff) {
        if (!isDefined(map) || !isDefined(sourceDiff)) {
            return Promise.reject();
        }

        const sourceLayer = map.getSource(this.getId());

        return sourceLayer
            .updateData(sourceDiff)
            .getData()
            .then((geoJSON) => {
                this.setGeoJson(geoJSON);
                return geoJSON;
            });
    }

    /**
     * Sets new data to the maplibregl's source layer calling sourceLayer.setData.
     *
     * @param {maplibregl.Map} map
     * @param {object} geoJson Feature properties are expected to represent application state
     * @returns
     */
    setDataOnMap(map, geoJson) {
        if (!isDefined(map) || !isDefined(geoJson)) {
            return;
        }

        const sourceLayer = map.getSource(this.getId());

        this.setGeoJson(geoJson);
        sourceLayer.setData(this.geoJSON);
    }

    removeFeatureFromMap(map, id) {
        const sourceLayer = map.getSource(this.getId());

        sourceLayer.updateData({ remove: [id] });
        this.removeFeature(id);
    }

    /**
     * Gets the geoJson object representing the "VKF geoJson specification". Use this for all non-application cases.
     * E.g. for exporting as a file, persisting in local storage, persisting in database, etc.
     *
     * @returns {object} geoJson
     */
    getGeoJsonForPersistence() {
        const convertedGeoJson = structuredClone(this.getGeoJson());
        let features = convertedGeoJson.features ?? [];

        features = features.map(convertFeatureForPersistenceState);
        convertedGeoJson.features = features;

        return convertedGeoJson;
    }

    /**
     * A helper to parse geoJson from persistence to application state.
     *
     * @param {object} geoJson geoJson representing the "VKF geoJson specification" (persistence state)
     * @returns {object} geoJson
     */
    static toApplicationState(geoJson) {
        if (!isDefined(geoJson)) {
            return geoJson;
        }

        const convertedGeoJson = structuredClone(geoJson);
        let features = convertedGeoJson.features ?? [];

        features = features.map(convertFeatureForApplicationState);
        convertedGeoJson.features = features;

        return convertedGeoJson;
    }

    /**
     * A helper to parse geoJson from application state to persistence state ("VKF geojson specification")
     *
     * @param {object} geoJson geoJson representing the application state
     * @returns {object} geoJson
     */
    static toPersistenceState(geoJson) {
        if (!isDefined(geoJson)) {
            return geoJson;
        }

        const convertedGeoJson = structuredClone(geoJson);
        let features = convertedGeoJson.features ?? [];

        features = features.map(convertFeatureForPersistenceState);
        convertedGeoJson.features = features;

        return convertedGeoJson;
    }

    /**
     * Gets the geoJson object representing the application state.
     * @returns {object} geoJson
     */
    getGeoJson() {
        return this.geoJSON;
    }

    /**
     * Sets the geoJson.
     * Note: Feature ids set in this method are not stable. Stable ids are expected to be set in the geojson.
     *
     * @param {object} geoJson
     */
    setGeoJson(geoJson) {
        const features = geoJson.features.map((feature, idx) => {
            if (!Object.hasOwn(feature, "properties")) {
                feature.properties = {};
            }

            if (!isDefined(feature.id)) {
                return {
                    ...feature,
                    id: idx + 1,
                };
            }

            return { ...feature };
        });

        const preparedGeoJson = { ...geoJson, features };

        this.geoJSON = preparedGeoJson;
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

    getPreviewFeature() {
        const bounds = this.getMetadata(METADATA.bounds);

        return {
            type: "Feature",
            properties: {},
            geometry: boundsToPolygon(bounds),
        };
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
     * @returns {LAYER_TYPES.VECTOR_MAP}
     */
    getType() {
        return LAYER_TYPES.VECTOR_MAP;
    }

    isRemote() {
        return isDefined(this.metadata[METADATA.vectorMapId]);
    }

    isLocal() {
        return !this.isRemote();
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

        map.removeSource(this.getId());
        this.#mapLibreLayerIds = [];
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
            const newFilters = ["all", defaultFilter];

            if (isDefined(timeFilter) && timeFilter.length > 0) {
                newFilters.push(timeFilter);
            }

            if (newFilters.length === 1) {
                map.setFilter(id, defaultFilter);
            } else {
                map.setFilter(id, newFilters);
            }
        }
    }
}

export default GeoJsonLayer;
