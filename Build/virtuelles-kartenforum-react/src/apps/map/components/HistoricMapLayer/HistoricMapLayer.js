/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { Tile } from "ol/layer";
import { XYZ } from "ol/source";
import { inherits, isDefined } from "../../../../util/util";

/**
 * Wrapper class / function representing a HistoricMap layer based on the tms protocol.
 *
 * @param {{
 *
 * }} settings
 * @param {ol.Map} map
 * @constructor
 * @extends {ol.layer.Tile}
 */
export const HistoricMap = function (settings) {
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
    this.time_ = settings.time_published;

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
    this.thumb_ = settings.thumb_url;

    /**
     * @type {boolean}
     * @expose
     */
    this.allowUseInLayerManagement = true;

    Tile.call(this, {
        extent: settings["clip"].getExtent(),
        source: new XYZ({
            maxZoom:
                settings.scale == 0
                    ? 15
                    : settings.scale <= 5000
                    ? 17
                    : settings.scale <= 15000
                    ? 16
                    : 15,
            urls: settings.urls.map((url) => `${url}/{z}/{x}/{-y}.png`),
            crossOrigin: "*",
        }),
    });
};

inherits(HistoricMap, Tile);

/**
 * @return {number}
 */
HistoricMap.prototype.getTimePublished = function () {
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
    return this.thumb_;
};

/**
 * @return {string}
 */
HistoricMap.prototype.getId = function () {
    return this.id_;
};

export default HistoricMap;
