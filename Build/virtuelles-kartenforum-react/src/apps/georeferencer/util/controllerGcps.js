/**
 * Created by jacob.mendt@pikobytes.de on 17.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import Observer from "../../../util/observer";
import Collection from "ol/src/Collection";
import Feature from "ol/src/Feature";
import Point from "ol/src/geom/Point";
import * as proj from "ol/src/proj";
import VectorLayer from "ol/src/layer/Vector";
import VectorSource from "ol/src/source/Vector";
import { createGcpDefaultStyle } from "./styles";

/**
 * Transforms the given pixel coordinates to geo pixel coordinate system.
 * @param {[number, number]} px_coords
 * @returns {[number, number]}
 */
function transformPixelToGeo(px_coords) {
    return [Math.round(px_coords[0]), Math.round(-1 * px_coords[1])];
}

/**
 * Controller for controlling the different drawing and interaction with the ground control points (GCP).
 *
 * @param {{
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
export class ControllerGcps extends Observer {
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
         * VectorSource for the source points
         * @type {ol.source.Vector}
         * @private
         */
        this.srcVectorSource_ = new VectorSource({
            features: new Collection(),
        });

        /**
         * VectorSource for the target points
         * @type {ol.source.Vector}
         * @private
         */
        this.trgVectorSource_ = new VectorSource({
            features: new Collection(),
        });

        // Add the sources and layer to the map
        const srcLayer = new VectorLayer({
            source: this.srcVectorSource_,
        });
        this.srcMap_.addLayer(srcLayer);
        const trgLayer = new VectorLayer({
            source: this.trgVectorSource_,
        });
        this.trgMap_.addLayer(trgLayer);

        this.loadData();
    }

    /**
     * This function initial loads the data to the vector source
     */
    loadData() {
        // Add ground control points to the map
        if (this.params_.gcps.length > 0) {
            for (let i = 0, l = this.params_.gcps.length; i < l; i++) {
                // Add source gcp
                const srcFeature = new Feature(
                    new Point(transformPixelToGeo(this.params_.gcps[i].source))
                );
                srcFeature.setStyle(createGcpDefaultStyle(`${i + 1}`));
                this.srcVectorSource_.addFeature(srcFeature);

                // Add target gcp
                const trgFeature = new Feature(
                    new Point(
                        proj.transform(
                            this.params_.gcps[i].target,
                            this.params_.target,
                            this.trgMap_.getView().getProjection()
                        )
                    )
                );
                trgFeature.setStyle(createGcpDefaultStyle(`${i + 1}`));
                this.trgVectorSource_.addFeature(trgFeature);
            }
        }

        // Get extent of target source features and focus map to it
        if (this.trgVectorSource_.getFeatures().length > 0) {
            this.trgMap_.getView().fit(this.trgVectorSource_.getExtent(), {
                padding: [100, 100, 100, 100],
                duration: 1000,
            });
        }
    }
}

export default ControllerGcps;
