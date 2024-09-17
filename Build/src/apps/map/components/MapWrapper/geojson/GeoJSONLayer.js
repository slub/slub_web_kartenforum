/*
 * Created by tom.schulze@pikobytes.de on 11.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */
import { LAYER_TYPES } from "../../CustomLayers/LayerTypes";
import { ApplicationLayer } from "./ApplicationLayer";
import {
    METADATA,
    MAPLIBRE_OPACITY_KEYS,
    GEOJSON_OPACITY_KEYS,
} from "./constants";
import { isDefined } from "../../../../../util/util";
import { addGeoJsonLayers } from "./addGeoJsonLayers.js";
import { bbox } from "@turf/bbox";
import { MAP_OVERLAY_FILL_ID } from "../../MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";

export class GeoJSONLayer extends ApplicationLayer {
    geoJSON = {};
    mapLibreLayerIds = [];

    constructor({ metadata, geometry, geoJSON }) {
        super({ metadata, geometry });
        this.geoJSON = geoJSON;

        this.#initialize();
    }

    #initialize() {
        // feature.id MUST be integer or string that is castable to integer
        // see: https://github.com/maplibre/maplibre-gl-js/discussions/3134
        // see: https://maplibre.org/maplibre-style-spec/expressions/#feature-state
        this.geoJSON.features = this.geoJSON.features.map((feature, idx) => ({
            ...feature,
            id: idx + 1,
        }));

        const bounds = this.geometry ? bbox(this.geometry) : bbox(this.geoJSON);
        this.metadata[METADATA.bounds] = bounds;

        this.metadata[METADATA.id] = crypto.randomUUID();
        this.metadata[METADATA.timePublished] = Date.now();
        this.metadata[METADATA.hasGeoReference] = true;
    }

    addLayerToMap(map) {
        addGeoJsonLayers(this, map);
    }

    getGeoJSON() {
        return this.geoJSON;
    }

    updateFeature(id, properties) {
        const idx = this.geoJSON.features.findIndex(
            (feature) => feature.id == id
        );

        if (idx < 0) {
            console.warn(
                `Trying to update a feature with non existing id '${id}'`
            );
            return;
        }

        const feature = this.geoJSON.features[idx];
        feature.properties = properties;
        this.geoJSON.features[idx] = feature;
    }

    removeFeature(id) {
        const idx = this.geoJSON.features.findIndex(
            (feature) => feature.id == id
        );

        if (idx < 0) {
            console.warn(
                `Trying to remove a feature with non existing id '${id}'`
            );
            return;
        }

        this.geoJSON.features.splice(idx, 1);
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

    getId() {
        return this.metadata.id;
    }

    getMetadata(key) {
        if (isDefined(key)) {
            return this.metadata[key];
        }

        return this.metadata;
    }

    updateMetadata(key, value) {
        if (!isDefined(key) || !isDefined(value)) {
            console.warn(`Trying to update metadata without key or value`);
            return;
        }

        if (!isDefined(METADATA[key])) {
            console.warn(`Trying to update metadata with invalid key '${key}'`);
            return;
        }

        this.metadata[key] = value;
    }

    /**
     *
     * @param {string} mapLayerId
     */
    addMapLayer(mapLayerId) {
        if (isDefined(mapLayerId)) {
            this.mapLibreLayerIds.push(mapLayerId);
        }
    }

    /**
     * Utility method to fetch the corresponding maplibre style layers.
     *
     * @protected
     * @param {maplibregl.Map} map
     * @returns {maplibregl.StyleLayer[]}
     */
    #getMapLibreLayers(map) {
        const mapLayers = this.mapLibreLayerIds.map((layerId) => {
            return map.getLayer(layerId);
        });

        if (mapLayers[0] === undefined) {
            return [];
        }

        return mapLayers;
    }

    getMapLibreLayerId() {
        return this.mapLibreLayerIds.length > 0
            ? this.mapLibreLayerIds[0]
            : null;
    }

    removeMapLibreLayers(map) {
        for (const { id } of this.#getMapLibreLayers(map)) {
            map.removeLayer(id);
        }
    }

    /**
     * All layers share the same opacity. Only the first map layer is considered for the opacity value.
     *
     * @param {maplibregl.Map} map
     */
    getOpacity(map) {
        const mapLayers = this.#getMapLibreLayers(map);

        if (mapLayers.length === 0) {
            return null;
        }

        const mapLibreLayerType = mapLayers[0].type;
        const opacityKey = MAPLIBRE_OPACITY_KEYS[mapLibreLayerType];

        const opacityExpression = map.getPaintProperty(
            mapLayers[0].id,
            opacityKey
        );

        if (typeof opacityExpression === "number") {
            return opacityExpression;
        }

        if (opacityExpression) {
            return opacityExpression[2];
        }

        return 1;
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

        // TODO console warnings: Expected value to be of type number, but found null instead
        for (const { id, type } of mapLayers) {
            const opacityKey = MAPLIBRE_OPACITY_KEYS[type];
            const propertyOpacityKey = GEOJSON_OPACITY_KEYS[type];
            map.setPaintProperty(id, opacityKey, [
                "*",
                ["coalesce", ["get", propertyOpacityKey], 1],
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
}
