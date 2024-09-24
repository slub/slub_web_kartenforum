/**
 * Created by nicolas.looschen@pikobytes.de on 12.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { ApplicationLayer } from "./ApplicationLayer.js";
import { METADATA } from "./GeoJsonLayer/constants.js";
import { addHistoricMapLayer } from "./addHistoricMapLayer.js";
import { LAYER_TYPES } from "./LayerTypes.js";
import { isDefined } from "../../../../util/util.js";
import { bbox } from "@turf/bbox";
import { MAP_OVERLAY_FILL_ID } from "../MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";

export class HistoricMapLayer extends ApplicationLayer {
    constructor({ metadata, geometry }) {
        super({ metadata, geometry });

        this.#initialize();
    }

    #initialize() {
        const bounds = this.geometry ? bbox(this.geometry) : undefined;
        this.metadata[METADATA.bounds] = bounds;
    }

    addLayerToMap(
        map,
        opt_initial_settings = { visibility: "visible", opacity: 1 }
    ) {
        return addHistoricMapLayer(this, map, opt_initial_settings);
    }

    toGeoJSON() {
        return {
            type: "Feature",
            properties: {},
            geometry: this.geometry,
        };
    }

    getGeometry() {
        return this.geometry;
    }
    isDisplayedInMap(map) {
        return (
            map.getSource(this.getId()) !== undefined &&
            map.getLayer(this.getId()) !== undefined
        );
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

    getId() {
        return this.metadata.id;
    }

    getType() {
        return LAYER_TYPES.HISTORIC_MAP;
    }

    setOpacity(map, opacity) {
        if (map.getLayer(this.getId())) {
            map.setPaintProperty(this.getId(), "raster-opacity", opacity);
        }
    }

    getOpacity(map) {
        if (map.getLayer(this.getId())) {
            return map.getPaintProperty(this.getId(), "raster-opacity") ?? 1;
        }

        return null;
    }

    moveToTop(map) {
        this.move(map, null);
    }

    move(map, beforeLayer) {
        // We manage the layer order in the application state, no need to send out an event
        map.moveLayer(this.getId(), beforeLayer ?? MAP_OVERLAY_FILL_ID);
    }

    getMapLibreLayerId() {
        return this.getId();
    }

    removeMapLibreLayers(map) {
        if (map.getLayer(this.getMapLibreLayerId()))
            map.removeLayer(this.getMapLibreLayerId());
        if (map.getSource(this.getId())) map.removeSource(this.getId());
    }

    setVisibility(map, visibility) {
        map.setLayoutProperty(
            this.getMapLibreLayerId(),
            "visibility",
            visibility
        );
    }

    isVisible(map) {
        return (
            map.getLayoutProperty(this.getMapLibreLayerId(), "visibility") ===
            "visible"
        );
    }
}

export default HistoricMapLayer;
