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
import VectorLayer from "ol/src/layer/Vector";
import VectorSource from "ol/src/source/Vector";

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
        this.sourceMap_ = options.sourceMap;

        /**
         * @type {ol.Map}
         * @private
         */
        this.targetMap_ = options.targetMap;

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
        this.srcSourceView_ = new VectorSource({
            features: new Collection(),
        });

        /**
         * VectorSource for the target points
         * @type {ol.source.Vector}
         * @private
         */
        this.trgTargetView_ = new VectorSource({
            features: new Collection(),
        });

        // Add the sources and layer to the map
        const sourceLayer = new VectorLayer({
            source: this.srcSourceView_,
        });
        this.sourceMap_.addLayer(sourceLayer);

        this.loadData();
    }

    /**
     * This function initial loads the data to the vector source
     */
    loadData() {
        // Add ground control points to the map
        if (this.params_.gcps.length > 0) {
            for (let i = 0, l = this.params_.gcps.length; i < l; i++) {
                this.srcSourceView_.addFeature(
                    new Feature(
                        new Point(
                            transformPixelToGeo(this.params_.gcps[i].source)
                        )
                    )
                );
            }
        }

        // Get extent of target source features and focus map to it
        // @todo
    }
}

export default ControllerGcps;

// for (var i = 0; i < gcps['gcps'].length; i++) {
//     var gcp = gcps['gcps'][i],
//         // create src feature
//         latlonSrs = vk2.utils.transformPixelToGeoCoords(gcp['source']),
//         srcFeature = new ol.Feature(new ol.geom.Point(latlonSrs)),
//         // create target (georef) feature
//         latlonTarget = ol.proj.transform(gcp['target'], gcps['target'], projections['target']),
//         targetFeature = new ol.Feature(new ol.geom.Point(latlonTarget));
//
//     gcpSources[0].addFeature(srcFeature);
//     gcpSources[1].addFeature(targetFeature);
// }
// ;
//gcpSources = [new ol.source.Vector({'features': new ol.Collection}), new ol.source.Vector({'features': new ol.Collection})],

// unref: new ol.layer.Vector({
//     'source': sources_.unref,
//     'style': function(feature, resolution) {
//         return [vk2.utils.Styles.GEOREFERENCE_POINT];
//     }
// }),
//     georef: new ol.layer.Vector({
//     'source': sources_.georef,
//     'style': function(feature, resolution) {
//         return [vk2.utils.Styles.GEOREFERENCE_POINT];
//     }
// })
