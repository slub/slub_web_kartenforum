/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { Tile } from "ol/layer";
import { XYZ } from "ol/source";
import TileWMS from "ol/source/TileWMS";

import { inherits, isDefined } from "../../../../util/util";
import { LAYER_TYPES } from "./LayerTypes";

export const getSourceIdForFeature = (feature) => {
    return feature.getId() ?? feature.get("title");
};

export const addHistoricMapLayer = (settings, map) => {
    const bounds = settings.clip?.getExtent();

    const metadata = {
        "vkf:id": isDefined(settings.id) ? settings.id : undefined,
        "vkf:time_published": settings.time_published,
        "vkf:title": isDefined(settings.title) ? settings.title : undefined,
        "vkf:thumb_url": settings.thumb_url,
        "vkf:allowUseInLayerManagement": true,
        "vkf:type": settings.type,
        "vkf:bounds": bounds,
    };

    const sourceSettings =
        settings.tms_urls !== undefined
            ? {
                  maxzoom: settings.maxZoom,
                  tiles: settings.tms_urls.map(
                      (url) => `${url}/{z}/{x}/{y}.png`
                  ),
                  scheme: "tms",
              }
            : settings.wms_settings;

    const sourceId = settings.sourceId;

    map.addSource(sourceId, {
        type: "raster",
        ...sourceSettings,
        bounds,
    });
    map.addLayer({ id: sourceId, type: "raster", metadata, source: sourceId });
};

/**
 * Wrapper class / function representing a HistoricMap layer based on the tms protocol.
 *
 * @param {{
 *
 * }} settings
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

    const source =
        settings.tms_urls !== undefined
            ? new XYZ({
                  maxZoom: settings.maxZoom,
                  urls: settings.tms_urls.map(
                      (url) => `${url}/{z}/{x}/{-y}.png`
                  ),
                  crossOrigin: "*",
              })
            : new TileWMS(settings.wms_settings);

    Tile.call(this, {
        extent: settings["clip"].getExtent(),
        properties: {
            layer_type: LAYER_TYPES.HISTORIC_MAP,
            type: settings.type,
        },
        source,
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
