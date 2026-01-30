/**
 * Created by jacob.mendt@pikobytes.de on 17.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import Collection from "ol/Collection";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import Point from "ol/geom/Point";
import { transform } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import round from "lodash.round";
import Observer from "@util/observer";
import {
    createClipPolygonStyle,
    createGcpDefaultStyle,
} from "@georeferencer/util/styles";
import {
    activateAddGcpAction,
    activateMoveGcpAction,
    activateDelGcpAction,
    activateDrawClipAction,
} from "./actions";
import { DEFAULT_PROJ } from "@georeferencer/util/util.js";
import { isDefined } from "@util/util";

/**
 * Transforms the given pixel coordinates to geo pixel coordinate system.
 * @param {[number, number]} px_coords
 * @returns {[number, number]}
 */
function transformPixelToGeo(px_coords) {
    return [Math.round(px_coords[0]), Math.round(-1 * px_coords[1])];
}

/**
 * Transforms the given geo pixel coordinates to pixel coordinate system.
 * @param {[number, number]} px_coords
 * @returns {[number, number]}
 */
function transformGeoToPixel(px_coords) {
    return [Math.round(px_coords[0]), Math.round(-1 * px_coords[1])];
}

/**
 * Controller for controlling the different drawing and interaction with the ground control points (GCP) and the clip polygon.
 *
 * @param {{
 *   clip: GeoJSON,
 *   onSetHelperMsg: Function,
 *   params: {
 *      algorithm: string,
 *      gcps: { source: [number, number], target: [number, number] }[],
 *      source: string,
 *      target: string,
 *   },
 *   sourceMap: ol.Map,
 *   targetMap: ol.Map,
 * }} options
 */
export class Controller extends Observer {
    constructor(options) {
        super();

        /**
         * @type {ol.Map}
         * @private
         */
        this.srcMap_ = options.sourceMap;

        /**
         * @type {ol.Map}
         * @private
         */
        this.trgMap_ = options.targetMap;

        /**
         * Transformation params
         * @type {{
         *   algorithm: string,
         *   gcps: { source: [number, number], target: [number, number] }[],
         *   source: string,
         *   target: string,
         * }}
         * @private
         */
        this.params_ = options.params;

        /**
         * Clip Polygon
         * @type {GeoJSON}
         */
        this.clip_ = options.clip ?? null;

        /**
         * Function should be called i a helper message should be set.
         * @type {Function|(function(*=): void)|*}
         * @private
         */
        this.onSetHelperMsg_ = options.onSetHelperMsg;

        //
        // Load and initializing sources for showing clip polygon
        //

        /**
         * VectorSource for clip polygon
         * @type {ol.source.Vector}
         * @private
         */
        this.clipVectorSource_ = new VectorSource({
            features: new Collection(),
        });
        const newClipLayer = new VectorLayer({
            source: this.clipVectorSource_,
            style: createClipPolygonStyle(),
            zIndex: 2,
        });
        newClipLayer.set("key", "clip");
        this.trgMap_.addLayer(newClipLayer);

        //
        // Load and initializing sources for showing gcps which are not edited yet
        //

        /**
         * VectorSource for pure displaying of source points
         * @type {ol.source.Vector}
         * @private
         */
        this.srcVectorSource_ = new VectorSource({
            features: new Collection(),
        });

        /**
         * VectorSource for pure displaying of target points
         * @type {ol.source.Vector}
         * @private
         */
        this.trgVectorSource_ = new VectorSource({
            features: new Collection(),
        });

        /**
         * @type {ol.layer.Vector}
         * @private
         */
        this.srcVectorLayer_ = new VectorLayer({
            source: this.srcVectorSource_,
        });
        // Add the sources and layer to the map
        this.srcMap_.addLayer(this.srcVectorLayer_);

        /**
         * @type {ol.layer.Vector}
         * @private
         */
        this.trgVectorLayer_ = new VectorLayer({
            source: this.trgVectorSource_,
            zIndex: 3,
        });
        this.trgMap_.addLayer(this.trgVectorLayer_);

        //
        // Load and initializing sources for showing gcps which are edited yet
        //

        /**
         * VectorSource for editing source points
         * @type {ol.source.Vector}
         * @private
         */
        this.editSrcVectorSource_ = new VectorSource({
            features: new Collection(),
        });

        /**
         * VectorSource for editing target points
         * @type {ol.source.Vector}
         * @private
         */
        this.editTrgVectorSource_ = new VectorSource({
            features: new Collection(),
        });

        // Add the sources and layer to the map
        this.srcMap_.addLayer(
            new VectorLayer({
                source: this.editSrcVectorSource_,
            })
        );
        this.trgMap_.addLayer(
            new VectorLayer({
                source: this.editTrgVectorSource_,
                zIndex: 4,
            })
        );

        this._loadData();
    }

    /**
     * This function initial loads the data to the vector source
     */
    _loadData() {
        // Add ground control points to the map
        if (this.params_.gcps.length > 0) {
            for (let i = 0, l = this.params_.gcps.length; i < l; i++) {
                const id = i + 1;

                // Add source gcp
                const srcFeature = new Feature(
                    new Point(transformPixelToGeo(this.params_.gcps[i].source))
                );
                srcFeature.setId(id);
                srcFeature.setStyle(createGcpDefaultStyle(`${id}`));
                this.srcVectorSource_.addFeature(srcFeature);

                // Add target gcp
                const trgFeature = new Feature(
                    new Point(
                        transform(
                            this.params_.gcps[i].target,
                            DEFAULT_PROJ,
                            this.trgMap_.getView().getProjection()
                        )
                    )
                );
                trgFeature.setId(id);
                trgFeature.setStyle(createGcpDefaultStyle(`${id}`));
                this.trgVectorSource_.addFeature(trgFeature);
            }
        }

        // Add the clip polygon to the map
        if (isDefined(this.clip_)) {
            const newFeature = new GeoJSON().readFeature(this.clip_, {
                dataProjection: DEFAULT_PROJ,
                featureProjection: this.trgMap_.getView().getProjection(),
            });

            this.clipVectorSource_.addFeature(newFeature);
        }
    }

    /**
     * Enables the add gcp action
     * @param {Function|undefined} disableFn
     * @returns {{
     *     disable: Function()
     * }}
     */
    activateAddAction(disableFn) {
        return activateAddGcpAction(
            this.srcMap_,
            this.trgMap_,
            this.srcVectorSource_,
            this.trgVectorSource_,
            this.editSrcVectorSource_,
            this.editTrgVectorSource_,
            this.onSetHelperMsg_,
            disableFn
        );
    }

    /**
     * Enables the move gcp action
     * @param {Function|undefined} disableFn
     * @returns {{
     *     disable: Function()
     * }}
     */
    activateMoveAction(disableFn) {
        return activateMoveGcpAction(
            this.srcMap_,
            this.trgMap_,
            this.srcVectorSource_,
            this.trgVectorSource_,
            this.onSetHelperMsg_,
            disableFn
        );
    }

    /**
     * Enables the del gcp action
     * @param {Function|undefined} disableFn
     * @returns {{
     *     disable: Function()
     * }}
     */
    activateDelAction(disableFn) {
        return activateDelGcpAction(
            this.srcMap_,
            this.trgMap_,
            this.srcVectorSource_,
            this.trgVectorSource_,
            this.srcVectorLayer_,
            this.trgVectorLayer_,
            this.onSetHelperMsg_,
            disableFn
        );
    }

    /**
     * Enables the del gcp action
     * @param {Function|undefined} disableFn
     * @returns {{
     *     disable: Function()
     * }}
     */
    activateDrawClipAction(disableFn) {
        return activateDrawClipAction(
            this.trgMap_,
            this.clipVectorSource_,
            this.onSetHelperMsg_,
            disableFn
        );
    }

    /**
     * Returns the current params
     * @returns {{
     *   algorithm: string,
     *   gcps: { source: [number, number], target: [number, number] }[],
     *   source: string,
     *   target: string,
     * }}
     */
    getParams() {
        // Parse gcps
        const srcFeatures = this.srcVectorSource_.getFeatures();
        const gcps = [];
        for (let i = 0, l = srcFeatures.length; i < l; i++) {
            const srcFt = srcFeatures[i];
            const trgFt = this.trgVectorSource_.getFeatureById(srcFt.getId());
            gcps.push({
                source: transformGeoToPixel(
                    srcFt.getGeometry().getCoordinates()
                ),
                target: transform(
                    trgFt.getGeometry().getCoordinates(),
                    this.trgMap_.getView().getProjection(),
                    DEFAULT_PROJ
                ),
            });
        }

        // Return the params
        return Object.assign({}, this.params_, { gcps: gcps });
    }

    /**
     * Returns the current clip feature
     * @returns {GeoJSON|undefined}
     */
    getClip() {
        const clipFeature =
            this.clipVectorSource_.getFeatures().length > 0
                ? this.clipVectorSource_.getFeatures()[0]
                : undefined;

        if (!isDefined(clipFeature)) {
            return this.clip_;
        }

        return new GeoJSON().writeGeometryObject(clipFeature.getGeometry(), {
            dataProjection: DEFAULT_PROJ,
            featureProjection: "EPSG:3857",
            decimals: 9,
        });
    }

    /**
     * Removes the current clip feature from the target layer and from internal state
     */
    removeClip() {
        this.clipVectorSource_.clear();
        this.clip_ = null;
    }

    /**
     * Checks if the clip or params have changed.
     *
     * @returns {boolean}
     * @warning This function may lead to wrong results because of inconsistent coordinate precision.
     */
    hasParamsOrClipChanged() {
        // For proper comparison we have to round the geo coordinates
        const precision = 6;
        const mappingFn = (gcp) =>
            Object.assign({}, gcp, {
                target: [
                    round(gcp.target[0], precision),
                    round(gcp.target[1], precision),
                ],
            });
        const srcGcps = this.params_.gcps.map(mappingFn);
        const trgGcps = this.getParams().gcps.map(mappingFn);
        const areGcpsSame = JSON.stringify(srcGcps) === JSON.stringify(trgGcps);

        // Check if the clip has changed
        const isClipSame =
            JSON.stringify(this.clip_) === JSON.stringify(this.getClip());

        return !areGcpsSame || !isClipSame;
    }
}

export default Controller;
