/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Tile } from "ol/layer";
import { Feature } from "ol";
import { XYZ } from "ol/source";

import { inherits, isDefined } from "../../util/util";

/**
 * @param {ol.geom.Polygon} clip
 * @param {number} id
 * @param {string} time
 * @param {string} title
 * @return {ol.Feature}
 * @private
 */
export const createClipFeature = (clip, id, time, title) => {
    // create the clip feature
    const feature = new Feature(clip);
    feature.setProperties({
        objectid: id,
        time: time,
        title: title,
    });
    feature.setId(id);

    return feature;
};

/**
 * Right now there are problems with the compiled version when using a ol3 compiled version. In that case
 * renamed variables of this object overwrite properties/function of the inherited object (ol.layer.Group). A
 * solution is to prevent renaming properties of this object through using the "expose" annotation.
 *
 * @param {vk2x.layer.HistoricMapOptions} settings
 * @param {ol.Map} map
 * @constructor
 * @extends {ol.layer.Tile}
 */
export const HistoricMap = function (settings) {
    /**
     * Holds the id of the underlying feature
     * @type {*|undefined}
     * @private
     */
    this.featureId_ = isDefined(settings.objectid)
        ? settings.objectid
        : undefined;

    /**
     * @type {string}
     * @private
     * @expose
     */
    this.id_ = isDefined(settings.id) ? settings.id : undefined;

    /**
     * @type {number}
     * @private
     * @expose
     */
    this.time_ = settings.time;

    /**
     * @type {string}
     * @private
     * @expose
     */
    this.title_ = isDefined(settings.title) ? settings.title : undefined;

    /**
     * @type {string}
     * @private
     * @expose
     */
    this.thumb_ = settings.thumbnail;
    //vk2.settings.THUMB_PATH

    this.tms_url_subdomains = settings.tms_url_subdomains;

    /**
     * @type {boolean}
     * @expose
     */
    this.allowUseInLayerManagement = true;

    const urls = this.tms_url_subdomains.map((subdomain) => {
        const url = `${settings.tms.replace(
            "{s}",
            subdomain
        )}/{z}/{x}/{-y}.png`;
        return url.replace("http:", "");
    });

    settings["extent"] = settings["clip"].getExtent();
    settings["source"] = new XYZ({
        maxZoom: settings["maxZoom"],
        urls: urls,
        crossOrigin: "*",
    });

    Tile.call(this, settings);
};

inherits(HistoricMap, Tile);

/**
 * @return {number}
 */
HistoricMap.prototype.getTime = function () {
    return this.time_;
};

/**
 * @return {string}
 */
HistoricMap.prototype.getTitle = function () {
    return this.title_;
};

/**
 * @return {string}
 */
HistoricMap.prototype.getThumbnail = function () {
    return this.thumb_.replace("http:", "");
};

/**
 * @return {string}
 */
HistoricMap.prototype.getId = function () {
    return this.id_;
};

/**
 * @return {string}
 */
HistoricMap.prototype.getFeatureId = function () {
    return this.featureId_;
};

/**
 * @return {Object}
 */
//vk2.layer.HistoricMap.prototype.getMetadata = function(){
//	return this._metadata;
//};

export default HistoricMap;
