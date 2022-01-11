/**
 * Created by nicolas.looschen@pikobytes.de on 06.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

// from https://github.com/openlayers/ol-cesium/blob/568a2b0de9cb01c1010cc5ca2bf9e4c3f720073f/src/olcs/OverlaySynchronizer.js

/**
 * @module olcs.OverlaySynchronizer
 */
import { getUid } from "olcs/util";
import olcsSynchronizedOverlay from "./customSychronizedOverlay";

class OverlaySynchronizer {
    /**
     * @param {!ol.Map} map
     * @param {!Cesium.Scene} scene
     * @constructor
     * @template T
     * @api
     */
    constructor(map, scene) {
        /**
         * @type {!ol.Map}
         * @protected
         */
        this.map = map;

        /**
         * @type {ol.Collection.<ol.Overlay>}
         * @private
         */
        this.overlays_ = this.map.getOverlays();

        /**
         * @type {!Cesium.Scene}
         * @protected
         */
        this.scene = scene;

        /**
         * @type {!Object<?,olcs.SynchronizedOverlay>}
         * @private
         */
        this.overlayMap_ = {};
    }

    /**
     * Destroy all and perform complete synchronization of the overlays.
     * @apisto
     */
    synchronize() {
        this.destroyAll();
        this.addOverlays();
        this.overlays_.on("add", this.addOverlayFromEvent_.bind(this));
        this.overlays_.on("remove", this.removeOverlayFromEvent_.bind(this));
    }

    /**
     * @param {ol.Collection.Event} event
     * @private
     */
    addOverlayFromEvent_(event) {
        const overlay = /** @type {ol.Overlay} */ (event.element);
        this.addOverlay(overlay);
    }

    /**
     * @api
     */
    addOverlays() {
        this.overlays_.forEach((overlay) => {
            this.addOverlay(overlay);
        });
    }

    /**
     * @param {ol.Overlay} overlay
     * @api
     */
    addOverlay(overlay) {
        if (!overlay) {
            return;
        }
        const cesiumOverlay = new olcsSynchronizedOverlay({
            scene: this.scene,
            synchronizer: this,
            parent: overlay,
        });

        const overlayId = getUid(overlay).toString();
        this.overlayMap_[overlayId] = cesiumOverlay;
    }

    /**
     * @param {ol.Collection.Event} event
     * @private
     */
    removeOverlayFromEvent_(event) {
        const removedOverlay = /** @type {ol.Overlay} */ (event.element);
        this.removeOverlay(removedOverlay);
    }

    /**
     * Removes an overlay from the scene
     * @param {ol.Overlay} overlay
     * @api
     */
    removeOverlay(overlay) {
        const overlayId = getUid(overlay).toString();
        const csOverlay = this.overlayMap_[overlayId];
        if (csOverlay) {
            csOverlay.destroy();
            delete this.overlayMap_[overlayId];
        }
    }

    /**
     * Destroys all the created Cesium objects.
     * @protected
     */
    destroyAll() {
        Object.keys(this.overlayMap_).forEach((key) => {
            const overlay = this.overlayMap_[key];
            overlay.destroy();
            delete this.overlayMap_[key];
        });
    }
}

export default OverlaySynchronizer;
