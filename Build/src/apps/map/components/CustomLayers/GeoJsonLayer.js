/**
 * Created by nicolas.looschen@pikobytes.de on 03.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { Vector } from "ol/layer";
import { Vector as VectorSource } from "ol/source";

import { inherits, isDefined } from "../../../../util/util";
// import { defaultStyleFunction } from "../MapWrapper/getDefaultStyles.js";
import { LAYER_TYPES } from "./LayerTypes";

/**
 * Wrapper class / function representing a HistoricMap layer based on the tms protocol.
 *
 * @param {{
 *
 * }} settings
 * @constructor
 * @extends {ol.layer.Tile}
 */
export const GeoJsonLayer = function (settings) {
    /**
     * @type {string}
     * @private
     * @expose
     */
    this.id_ = settings.feature.getId() ?? undefined;

    /**
     * @type {number}
     * @private
     * @expose
     */
    this.time_ = settings.feature.get("time_changed");

    /**
     * @type {string}
     * @private
     * @expose
     */
    this.title_ = isDefined(settings.feature.get("title"))
        ? settings.feature.get("title")
        : undefined;

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

    Vector.call(this, {
        source: new VectorSource({
            features: settings.feature.get("geojsonFeatures"),
        }),
        styles: defaultStyleFunction,
        properties: { layer_type: LAYER_TYPES.GEOJSON },
    });
    this.set("altitudeMode", "clampToGround");
};

inherits(GeoJsonLayer, Vector);

/**
 * @return {number}
 */
GeoJsonLayer.prototype.getTimePublished = function () {
    return this.time_;
};

/**
 * @return {string}
 */
GeoJsonLayer.prototype.getTitle = function () {
    return this.title_;
};

/**
 * @return {string}
 */
GeoJsonLayer.prototype.getThumbnail = function () {
    return this.thumb_;
};

/**
 * @return {string}
 */
GeoJsonLayer.prototype.getId = function () {
    return this.id_;
};

export default GeoJsonLayer;
