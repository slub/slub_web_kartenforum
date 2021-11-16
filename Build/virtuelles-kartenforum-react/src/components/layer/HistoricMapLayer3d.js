/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { inherits, isDefined } from "../../util/util";
import { XYZ } from "ol/source";
import { Tile } from "ol/layer";

/**
 * Right now there are problems with the compiled version when using a ol3 compiled version. In that case
 * renamed variables of this object overwrite properties/function of the inherited object (ol.layer.Group). A
 * solution is to prevent renaming properties of this object through using the "expose" annotation.
 *
 * @param {vk2x.layer.HistoricMap3DOptions} settings
 * @param {ol.Map} map
 * @param {boolean=} opt_3d
 * @constructor
 * @extends {ol.layer.Group}
 */
export const HistoricMap3D = function (settings, map, opt_3d) {
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
inherits(HistoricMap3D, Tile);

/**
 * @return {number}
 */
HistoricMap3D.prototype.getTime = function () {
    return this.time_;
};

/**
 * @return {string}
 */
HistoricMap3D.prototype.getTitle = function () {
    return this.title_;
};

/**
 * @return {string}
 */
HistoricMap3D.prototype.getThumbnail = function () {
    return this.thumb_;
};

/**
 * @return {string}
 */
HistoricMap3D.prototype.getId = function () {
    return this.id_;
};

export default HistoricMap3D;
