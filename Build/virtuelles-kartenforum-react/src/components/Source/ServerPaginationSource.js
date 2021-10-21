/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Collection } from "ol";
import { equals } from "ol/extent";
import { transformExtent } from "ol/proj";
import axios from "axios";
import {
    calculateMapExtentForPixelViewport,
    getPolygonFromExtent,
    isDefined,
} from "../../util/util";
import { getSpatialQuery, getToGeorefQuery } from "../../util/query";
import { readFeatures } from "../../util/parser";

/**
 * @enum {string}
 */
const ServerPaginationEventType = {
    // Is triggered if there was a pagination event. Incrementel data is added.
    PAGINATE: "paginate",
    // Refresh is called when the complete search data is refreshed
    REFRESH: "refresh",
};

/**
 * @classdesc
 * A vector source in one of the supported formats, using a custom function to
 * read in the data from a remote server.
 *
 * @param {vk2x.source.ServerPaginationOptions} options
 * @constructor
 * @extends {goog.events.EventTarget}
 */
export class ServerPagination {
    constructor(options) {
        this.updateCallback = options.updateCallback;
        this.elasticsearch_srs = options.elasticsearch_srs;
        this.elasticsearch_node = options.elasticsearch_node;
        this.is3d = options.is3d;

        /**
         * @private
         * @type {string}
         */
        this.projection_ =
            options.projection !== undefined
                ? options.projection
                : "EPSG:900913";

        /**
         * @private
         * @type {number}
         */
        this.maxFeatures_ =
            options.maxfeatures !== undefined ? options.maxfeatures : 20;

        /**
         * @private
         * @type {Array.<number>|undefined} An array of numbers representing an extent: [minx, miny, maxx, maxy]
         */
        this.lastUpdateExtent_ = undefined;

        /**
         * @private
         * @type {ol.Collection}
         */
        this.featureCol_ = new Collection();

        /**
         * @private
         * @type {string}
         */
        this.sortAttribute_ = "title";

        /**
         * @private
         * @type {string}
         */
        this.sortOrder_ = "ascending";

        /**
         * This variable give the starting point for pagination
         * @private
         * @type {number}
         */
        this.index_ = 0;

        /**
         * @private
         * @type {number|undefined}
         */
        this.totalFeatures_ = undefined;

        const start = options.time !== undefined ? options.time[0] : 1625,
            end = options.time !== undefined ? options.time[1] : 1965;
        /**
         * @type {Object}
         * @private
         */
        this.timeFilter_ = {
            START: start,
            END: end,
        };

        /**
         * @private
         * @type {ol.Map}
         */
        this.map_ = options.map;

        /**
         * @private
         * @type {Array.<Object>}
         */
        this.facets_ = [];

        /**
         * @private
         * @type {boolean}
         */
        this.georeference_ = true;

        /**
         * For preventing deep pagination
         * @type {number}
         * @private
         */
        this.MAX_PAGINATION_FEATURE = 500;

        this.activate();
    }

    activate = () => {
        this.map_.on("moveend", () => {
            const spatialExtent = calculateMapExtentForPixelViewport(this.map_);
            if (
                !isDefined(this.lastUpdateExtent_) ||
                !equals(this.lastUpdateExtent_, spatialExtent)
            ) {
                this.update_();
            }
        });
    };

    /**
     * @param {Array.<number>} extent An array of numbers representing an extent: [minx, miny, maxx, maxy]
     * @param {string} projection
     * @return {Object}
     * @private
     */
    createSearchRequest_ = function (extent, projection) {
        const timeValues = [
                this.timeFilter_.START + "-01-01",
                this.timeFilter_.END + "-01-01",
            ],
            sortOrd_ = this.sortOrder_ === "ascending" ? "asc" : "desc";

        if (this.georeference_) {
            // build response with bbox filter
            const bboxPolygon = getPolygonFromExtent(
                transformExtent(extent, projection, this.elasticsearch_srs)
            );
            return getSpatialQuery(
                "time",
                timeValues,
                "geometry",
                bboxPolygon,
                this.sortAttribute_,
                sortOrd_,
                this.facets_
            );
        } else {
            return getToGeorefQuery(
                "time",
                timeValues,
                this.sortAttribute_,
                sortOrd_,
                this.facets_
            );
        }
    };

    dispatchUpdate = (features) => {
        this.updateCallback((oldState) => ({
            features: oldState.features.concat(features),
            featureCount: this.totalFeatures_,
            id: oldState.id,
        }));
    };

    dispatchRefresh = (features) => {
        this.updateCallback({
            features,
            featureCount: this.totalFeatures_,
            id: Date.now(),
        });
    };

    /**
     * @return {ol.Collection}
     */
    getFeatures = () => {
        return this.featureCol_;
    };

    ///**
    //* @param {string} blattnr
    //* @return {Array.<ol.Feature>}
    //*/
    //const getFeatureForBlattnr = function(blattnr){
    //	var returnArr = [];
    //	this.featureCol_.forEach(function(feature){
    //		if (feature.get('blattnr') === blattnr)
    //			returnArr.push(feature);
    //	});
    //	return returnArr;
    //};

    /**
     *
     */

    /**
     * @return {number|undefined}
     */
    getTotalFeatures = function () {
        return this.totalFeatures_;
    };

    /**
     * @return {string}
     */
    getSortAttribute = function () {
        return this.sortAttribute_;
    };

    /**
     * @return {string}
     */
    getSortOrder = function () {
        return this.sortOrder_;
    };

    /**
     * Method checks if all features for a given extent are loaded.
     * @return {boolean}
     */
    isComplete = function () {
        return this.featureCol_.getLength() >= this.totalFeatures_;
    };

    /**
     * @param {Array.<number>} extent An array of numbers representing an extent: [minx, miny, maxx, maxy]
     * @param {string} projection
     * @param {Function} event_callback
     */
    loadFeatures_ = (extent, projection, event_callback) => {
        // build elasticsearch request
        const requestPayload = this.createSearchRequest_(extent, projection),
            requestUrl =
                this.elasticsearch_node +
                "/_search?from=" +
                this.index_ +
                "&size=" +
                this.maxFeatures_;

        axios.post(requestUrl, JSON.stringify(requestPayload)).then((resp) => {
            if (resp.status === 200) {
                const data = resp.data;
                this.totalFeatures_ = data["hits"]["total"];
                const parsedFeatures = readFeatures(
                    data["hits"]["hits"],
                    this.elasticsearch_srs,
                    projection,
                    this.is3d
                );

                // fill featureCol and increment startIndex
                this.featureCol_.extend(parsedFeatures);
                this.index_ += parsedFeatures.length;

                event_callback(parsedFeatures);
            }
        });

        // var xhr = new goog.net.XhrIo();
        // goog.events.listenOnce(
        //     xhr,
        //     "success",
        //     function (e) {
        //         //if (goog.DEBUG){
        //         //	console.log('Receive features');
        //         //};
        //
        //         var xhr = /** @type {goog.net.XhrIo} */ (e.target);
        //         if (xhr.getResponseJson()) {
        //             // parse response GeoJSON
        //             var data = xhr.getResponseJson();
        //             this.totalFeatures_ = data["hits"]["total"];
        //             xhr.dispose();
        //             var parsedFeatures = readFeatures(
        //                 data["hits"]["hits"],
        //                 this.elasticsearch_srs,
        //                 projection
        //             );
        //
        //             //if (goog.DEBUG){
        //             //	console.log(parsedFeatures);
        //             //};
        //
        //             // fill featureCol and increment startIndex
        //             this.featureCol_.extend(parsedFeatures);
        //             this.index_ += parsedFeatures.length;
        //
        //             event_callback.call(this, parsedFeatures);
        //         } else {
        //             console.log("Response is empty");
        //         }
        //     },
        //     false,
        //     this
        // );
        // xhr.send(requestUrl, "POST", JSON.stringify(requestPayload));
    };

    /**
     * @private
     */
    paginate_ = () => {
        // check if there are anymore features to paginate and if yes gramp them
        if (
            this.index_ < this.totalFeatures_ &&
            this.index_ < this.MAX_PAGINATION_FEATURE
        ) {
            const spatialExtent = calculateMapExtentForPixelViewport(this.map_);
            this.loadFeatures_(
                spatialExtent,
                this.projection_,
                this.dispatchUpdate
            );
        }
    };

    refresh = () => {
        this.refreshFeatures_(
            calculateMapExtentForPixelViewport(this.map_),
            this.projection_
        );
    };

    /**
     * Triggers a update events based of the actual server pagination settings of the search list.
     * @private
     */
    update_ = () => {
        const spatialExtent = calculateMapExtentForPixelViewport(this.map_);
        this.refreshFeatures_(spatialExtent, this.projection_);
        this.lastUpdateExtent_ = spatialExtent.slice(0);
    };

    /**
     * @param {Array.<number>} extent An array of numbers representing an extent: [minx, miny, maxx, maxy]
     * @param {string} projection
     */
    refreshFeatures_ = (extent, projection) => {
        this.featureCol_.clear();
        this.index_ = 0;
        this.loadFeatures_(extent, projection, this.dispatchRefresh);
    };

    /**
     * @param {Object} newFacets
     */
    setFacets = (newFacets) => {
        this.georeference_ = newFacets["georeference"];
        this.facets_ = newFacets["facets"];
        this.update_();
    };

    /**
     * @param {string} sortAttribute
     */
    setSortAttribute = (sortAttribute) => {
        this.sortAttribute_ = sortAttribute;
    };

    /**
     * @param {string} sortOrder
     */
    setSortOrder = (sortOrder) => {
        this.sortOrder_ = sortOrder;
    };

    /**
     * @param {number=} opt_start_time
     * @param {number=} opt_end_time
     */
    setTimeFilter = (opt_start_time, opt_end_time) => {
        // incase of a resetting
        const old_start = this.timeFilter_.START;

        if (isDefined(opt_start_time) && !isNaN(opt_start_time)) {
            if (opt_start_time > this.timeFilter_.END)
                throw {
                    name: "WrongParameterExecption",
                    message:
                        "Start value shouldn't be higher than the end value.",
                };
            this.timeFilter_.START = opt_start_time;
        }

        if (isDefined(opt_end_time) && !isNaN(opt_end_time)) {
            if (opt_end_time < this.timeFilter_.START) {
                // reset start value and throw error
                this.timeFilter_.START = old_start;
                throw {
                    name: "WrongParameterExecption",
                    message:
                        "End value shouldn't be lower than the start value.",
                };
            }
            this.timeFilter_.END = opt_end_time;
        }
    };

    update3dState = (new3dState) => {
        this.is3d = new3dState;
    };
}

export default ServerPagination;
