/**
 * Created by nicolas.looschen@pikobytes.de on 12.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { ApplicationLayer } from "../ApplicationLayer.js";
import { METADATA, LAYER_TYPES } from "../constants.js";
import { addHistoricMapLayer } from "./addHistoricMapLayer.js";
import { bbox } from "@turf/bbox";
import { MAP_OVERLAY_FILL_ID } from "@map/components/MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";

// TODO discuss whether it makes sense to use a MoscaicMapLayer
// the need may arise when single sheet mosaic maps need to be moved and the different overlay layers need to be considered
class HistoricMapLayer extends ApplicationLayer {
    #isMissing = false;

    constructor({ metadata, geometry }) {
        super({ metadata, geometry });

        this.#initialize();
    }

    #initialize() {
        const bounds = this.geometry ? bbox(this.geometry) : undefined;
        this.metadata[METADATA.bounds] = bounds;
    }

    addLayerToMap(map, { sourceSettings, layerSettings }) {
        if (map.getSource(this.getId())) {
            console.error(
                `Source with id '${this.getId()}' exists already in map.`
            );
            return;
        }

        return addHistoricMapLayer(this, map, sourceSettings, layerSettings);
    }

    addToOverlay(map, overlayId) {
        const source = map.getSource(overlayId);
        if (source) {
            const feature = this.getPreviewFeature();
            feature.id = this.getId();
            const add = [feature];
            source.updateData({ add });
        }
    }

    removeFromOverlay(map, overlayId) {
        const source = map.getSource(overlayId);
        if (source) {
            const remove = [this.getId()];
            source.updateData({ remove });
        }
    }

    getPreviewFeature() {
        return {
            type: "Feature",
            properties: {},
            geometry: this.geometry,
        };
    }

    isDisplayedInMap(map) {
        return (
            map.getSource(this.getId()) !== undefined &&
            map.getLayer(this.getId()) !== undefined
        );
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

    isMissing() {
        return this.#isMissing;
    }

    setIsMissing(isMissing) {
        this.#isMissing = isMissing;
    }
}

export default HistoricMapLayer;
