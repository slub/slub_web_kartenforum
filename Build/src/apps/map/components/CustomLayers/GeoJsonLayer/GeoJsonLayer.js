/*
 * Created by tom.schulze@pikobytes.de on 11.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { ApplicationLayer } from "../ApplicationLayer";

import { isDefined, isValidUrl } from "@util/util";
import {
    boundsToPolygon,
    convertFeatureForApplicationState,
    convertFeatureForPersistenceState,
} from "./util";
import { EXTERNAL_CONTENT_TYPES, LAYER_TYPES, METADATA } from "../constants";
import { bbox } from "@turf/bbox";
import { getDefaultMetadataTimePeriod } from "@util/date";
import VkfMapInteractionStrategy from "./VkfMapInteractionStrategy/VkfMapInteractionStrategy";
import IdohistMapInteractionStrategy from "./IdohistMapInteractionStrategy/IdohistMapInteractionStrategy";

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
    #mapInteractionStrategy = null;

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

        const contentType = this.metadata[METADATA.externalContentType];
        if (contentType === EXTERNAL_CONTENT_TYPES.IDOHIST) {
            this.#mapInteractionStrategy = new IdohistMapInteractionStrategy(
                this.getId()
            );
        } else {
            this.#mapInteractionStrategy = new VkfMapInteractionStrategy(
                this.getId()
            );
        }
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
        this.metadata[METADATA.timePeriod] =
            this.metadata[METADATA.timePeriod] ??
            getDefaultMetadataTimePeriod();
        this.metadata[METADATA.hasGeoReference] = true;
    }

    /**
     * Gets the geoJson object representing the application state.
     * @returns {object} geoJson
     */
    getGeoJson() {
        return this.geoJSON;
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
     * Sets the geoJson on the layer.
     *
     * Note: The map sources are not updated.
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
     * Returns true if GeoJsonLayer represents an external vector map with a valid content url
     * @returns {boolean}
     */
    isExternalVectorMap() {
        const contentUrl = this.metadata[METADATA.externalContentUrl];

        return isDefined(contentUrl) && isValidUrl(contentUrl);
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
     * @param {object} settings
     * @param {object} settings.layerSettings the initial style layer settings. Used when restoring a map from localstorage or map views.
     * @param {"visible" | "none"} settings.layerSettings.visibility
     * @param {number} settings.layerSettings.opacity A number from 0 – 1
     * @returns
     */
    addLayerToMap(map, settings) {
        this.#mapInteractionStrategy.addLayerToMap(map, settings, this.geoJSON);
    }

    removeMapLibreLayers(map) {
        this.#mapInteractionStrategy.removeLayerFromMap(map);
    }

    /**
     * Sets new geojson data and updates the map.
     *
     * @param {maplibregl.Map} map
     * @param {object} geoJson Feature properties are expected to represent application state
     * @returns
     */
    setDataOnMap(map, geoJson) {
        if (!isDefined(map) || !isDefined(geoJson)) {
            return;
        }

        // send geojson through setter to process it
        this.setGeoJson(geoJson);
        this.#mapInteractionStrategy.setDataOnMap(map, this.geoJSON);
    }

    /**
     * Returns a single maplibre style layer id representing the position of the application layer in the maplibre layer stack.
     *
     * @returns {string} The layerId
     */
    getMapLibreLayerId() {
        return this.#mapInteractionStrategy.getLayerId();
    }

    /**
     * All layers share the same opacity. The SYMBOL layer does not have an opacity value.
     * Cycle through all GeoJSON layers until a layer with an opacity property is found.
     *
     * @param {maplibregl.Map} map
     */
    getOpacity(map) {
        return this.#mapInteractionStrategy.getOpacity(map);
    }

    /**
     * Sets the opacity of the layer on the map.
     *
     * @param {maplibregl.Map} map
     * @param {number} opacity value from 0 – 1
     */
    setOpacity(map, opacity) {
        this.#mapInteractionStrategy.setOpacity(map, opacity);
    }

    /**
     * All layers share the same visiblity. Only the first map layer is considered for the visibility status.
     *
     * @param {maplibregl.Map} map
     */
    isVisible(map) {
        return this.#mapInteractionStrategy.isVisible(map);
    }

    /**
     * @param {maplibregl.Map} map
     * @param {"visible" | "none"} visiblity
     */
    setVisibility(map, visibility) {
        this.#mapInteractionStrategy.setVisibility(map, visibility);
    }

    /**
     *
     * @param {maplibregl.Map} map
     */
    isDisplayedInMap(map) {
        return this.#mapInteractionStrategy.isDisplayedInMap(map);
    }

    move(map, beforeLayer) {
        this.#mapInteractionStrategy.move(map, beforeLayer);
    }

    moveToTop(map) {
        this.move(map, null);
    }

    /**
     * Sets the maplibregl map filter for each geojson layer.
     * @param {maplibregl.map} map
     * @param {object} filterValues filter values to build the filter expressions. Resets filter to default if undefined.
     * @param {[number, number]} filterValues.timeExtent the time extent to build the time filter
     * @returns
     */
    setFilters(map, filterValues) {
        if (!isDefined(filterValues) || filterValues?.length === 0) {
            this.#mapInteractionStrategy.resetFilters(map);
            return;
        }

        this.#mapInteractionStrategy.setFilters(map, filterValues);
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
}

export default GeoJsonLayer;
