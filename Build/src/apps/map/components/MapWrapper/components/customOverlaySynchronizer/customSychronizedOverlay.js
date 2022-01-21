/**
 * Created by nicolas.looschen@pikobytes.de on 06.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * This custom version of the synchronized overlay throws away a lot of the functionality for this special use case.
 * Instead of creating a copy of the overlay, the actual ol overlay is used and only its position is updated when the
 * scene changes.
 */

/**
 * @module olcs.SynchronizedOverlay
 */
import { transform } from "ol/proj.js";
import { unByKey as olObservableUnByKey } from "ol/Observable.js";

/**
 * Options for SynchronizedOverlay
 * @typedef {Object} SynchronizedOverlayOptions
 * @property {!Cesium.Scene} scene
 * @property {olOverlay} parent
 * @property {!import('olsc/OverlaySynchronizer.js').default} synchronizer
 */

class SynchronizedOverlay {
    /**
     * @param {olcsx.SynchronizedOverlayOptions} options SynchronizedOverlay Options.
     * @api
     */
    constructor(options) {
        const parent = options.parent;
        /**
         * @private
         * @type {?Function}
         */
        this.scenePostRenderListenerRemover_ = null;

        /**
         * @private
         * @type {!Cesium.Scene}
         */
        this.scene_ = options.scene;

        /**
         * @private
         * @type {!olcs.OverlaySynchronizer}
         */
        this.synchronizer_ = options.synchronizer;

        /**
         * @private
         * @type {!ol.Overlay}
         */
        this.parent_ = parent;

        /**
         * @private
         * @type {ol.Coordinate|undefined}
         */
        this.positionWGS84_ = undefined;

        /**
         * @private
         * @type {Array.<MutationObserver>}
         */
        this.attributeObserver_ = [];

        /**
         * @private
         * @type {Array<ol.EventsKey>}
         */
        this.listenerKeys_ = [];

        this.listenerKeys_.push(
            this.parent_.on(
                "change:position",
                this.handlePositionChanged.bind(this)
            )
        );

        this.handleMapChanged();
    }

    /**
     * @param {Node} target
     * @private
     */
    observeTarget_(target) {
        this.attributeObserver_.forEach((observer) => {
            observer.disconnect();
        });
        this.attributeObserver_.length = 0;
    }

    /**
     * Get the scene associated with this overlay.
     * @see ol.Overlay.prototype.getMap
     * @return {!Cesium.Scene} The scene that the overlay is part of.
     * @api
     */
    getScene() {
        return this.scene_;
    }

    /**
     * @override
     */
    handleMapChanged() {
        if (this.scenePostRenderListenerRemover_) {
            this.scenePostRenderListenerRemover_();
        }
        this.scenePostRenderListenerRemover_ = null;
        const scene = this.getScene();
        if (scene) {
            this.scenePostRenderListenerRemover_ =
                scene.postRender.addEventListener(
                    this.updatePixelPosition.bind(this)
                );
            this.updatePixelPosition();
        }
    }

    /**
     * @override
     */
    handlePositionChanged() {
        // transform position to WGS84
        const position = this.parent_.getPosition();
        if (position) {
            const sourceProjection = this.parent_
                .getMap()
                .getView()
                .getProjection();
            this.positionWGS84_ = transform(
                position,
                sourceProjection,
                "EPSG:4326"
            );
        } else {
            this.positionWGS84_ = undefined;
        }
        this.updatePixelPosition();
    }

    /**
     * @override
     */
    updatePixelPosition() {
        const position = this.positionWGS84_;
        if (!this.scene_ || !position) {
            this.parent_.setVisible(false);
            return;
        }
        let height = 0;
        if (position.length === 2) {
            const globeHeight = this.scene_.globe.getHeight(
                Cesium.Cartographic.fromDegrees(position[0], position[1])
            );
            if (globeHeight && this.scene_.globe.tilesLoaded) {
                position[2] = globeHeight;
            }
            if (globeHeight) {
                height = globeHeight;
            }
        } else {
            height = position[2];
        }
        const cartesian = Cesium.Cartesian3.fromDegrees(
            position[0],
            position[1],
            height
        );
        const camera = this.scene_.camera;
        const ellipsoidBoundingSphere = new Cesium.BoundingSphere(
            new Cesium.Cartesian3(),
            6356752
        );
        const occluder = new Cesium.Occluder(
            ellipsoidBoundingSphere,
            camera.position
        );
        // check if overlay position is behind the horizon
        if (!occluder.isPointVisible(cartesian)) {
            this.parent_.setVisible(false);
            return;
        }
        const cullingVolume = camera.frustum.computeCullingVolume(
            camera.position,
            camera.direction,
            camera.up
        );
        // check if overlay position is visible from the camera
        if (
            cullingVolume.computeVisibility(
                new Cesium.BoundingSphere(cartesian)
            ) !== 1
        ) {
            this.parent_.setVisible(false);
            return;
        }
        this.parent_.setVisible(true);

        const pixelCartesian =
            this.scene_.cartesianToCanvasCoordinates(cartesian);
        const pixel = [pixelCartesian.x, pixelCartesian.y];
        const mapSize = [this.scene_.canvas.width, this.scene_.canvas.height];
        this.parent_.updateRenderedPosition(pixel, mapSize);
    }

    /**
     * Destroys the overlay, removing all its listeners and elements
     * @api
     */
    destroy() {
        if (this.scenePostRenderListenerRemover_) {
            this.scenePostRenderListenerRemover_();
        }

        olObservableUnByKey(this.listenerKeys_);
        this.listenerKeys_.splice(0);
    }
}

export default SynchronizedOverlay;
