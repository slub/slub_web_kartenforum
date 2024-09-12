/*
 * Created by tom.schulze@pikobytes.de on 11.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

//@TODO confirm new dependency
import { v4 as uuidv4 } from "uuid";
import { LAYER_TYPES } from "../../CustomLayers/LayerTypes";
import { ApplicationLayer } from "./ApplicationLayer";
import { METADATA } from "./constants";
import { isDefined } from "../../../../../util/util";
import { addGeoJsonLayers } from "./addGeoJsonLayers.js";

export class GeoJSONLayer extends ApplicationLayer {
    geoJSON = {};
    mapLibreLayerIds = [];

    constructor({ metadata, geometry, geoJSON }) {
        super({ metadata, geometry });
        this.geoJSON = geoJSON;

        this.#initialize();
    }

    #initialize() {
        this.metadata[METADATA.id] = uuidv4();
        this.metadata[METADATA.timePublished] = Date.now();
        this.metadata[METADATA.hasGeoReference] = true;
    }

    addLayerToMap(map) {
        addGeoJsonLayers(this, map);
    }

    getGeoJSON() {
        return this.geoJSON;
    }
    /**
     *
     * @param {maplibregl.Map} map
     */
    isDisplayedInMap(map) {
        map.getSource(this.getId()) !== undefined;
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
    setVisibility(map, visiblity) {
        const mapLayers = this.#getMapLibreLayers(map);

        if (mapLayers.length === 0) {
            return;
        }

        for (const { id } of mapLayers) {
            map.setLayoutProperty(id, "visibility", visiblity);
        }
    }
}
