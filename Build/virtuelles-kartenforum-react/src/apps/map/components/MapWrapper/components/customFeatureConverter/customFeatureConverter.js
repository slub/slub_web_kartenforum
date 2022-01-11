/**
 * Created by nicolas.looschen@pikobytes.de on 10.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import olcsFeatureConverter from "olcs/FeatureConverter.js";
import olcsCore from "olcs/core";
import olcsUtil, { getUid } from "olcs/util.js";
import { Icon } from "ol/style";

/*
 * Custom variant of the openlayers feature converter, because the property "disableDepthTestDistance" of the billboard
 * has to be set in order to fix artifacts produces by the terrain exaggeration
 */
class customFeatureConverter extends olcsFeatureConverter {
    constructor(scene) {
        super(scene);
    }

    /**
     * Convert a point geometry to a Cesium BillboardCollection.
     * @param {ol.layer.Vector|ol.layer.Image} layer
     * @param {!ol.Feature} feature OpenLayers feature..
     * @param {!ol.geom.Point} olGeometry OpenLayers point geometry.
     * @param {!ol.ProjectionLike} projection
     * @param {!ol.style.Style} style
     * @param {!ol.style.Image} imageStyle
     * @param {!Cesium.BillboardCollection} billboards
     * @param {function(!Cesium.Billboard)=} opt_newBillboardCallback Called when the new billboard is added.
     * @api
     */
    createBillboardFromImage(
        layer,
        feature,
        olGeometry,
        projection,
        style,
        imageStyle,
        billboards,
        opt_newBillboardCallback
    ) {
        if (imageStyle instanceof Icon) {
            // make sure the image is scheduled for load
            imageStyle.load();
        }

        const image = imageStyle.getImage(1); // get normal density
        const isImageLoaded = function (image) {
            return (
                image.src != "" &&
                image.naturalHeight != 0 &&
                image.naturalWidth != 0 &&
                image.complete
            );
        };
        const reallyCreateBillboard = function () {
            if (!image) {
                return;
            }
            if (
                !(
                    image instanceof HTMLCanvasElement ||
                    image instanceof Image ||
                    image instanceof HTMLImageElement
                )
            ) {
                return;
            }
            const center = olGeometry.getCoordinates();
            const position = olcsCore.ol4326CoordinateToCesiumCartesian(center);
            let color;
            const opacity = imageStyle.getOpacity();
            if (opacity !== undefined) {
                color = new Cesium.Color(1.0, 1.0, 1.0, opacity);
            }

            const scale = imageStyle.getScale();
            const heightReference = this.getHeightReference(
                layer,
                feature,
                olGeometry
            );

            const bbOptions =
                /** @type {Cesium.optionsBillboardCollectionAdd} */ ({
                    // always update Cesium externs before adding a property
                    image,
                    color,
                    scale,
                    heightReference,
                    position,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                });

            // merge in cesium options from openlayers feature
            Object.assign(bbOptions, feature.get("cesiumOptions"));

            if (imageStyle instanceof Icon) {
                const anchor = imageStyle.getAnchor();
                if (anchor) {
                    bbOptions.pixelOffset = new Cesium.Cartesian2(
                        (image.width / 2 - anchor[0]) * scale,
                        (image.height / 2 - anchor[1]) * scale
                    );
                }
            }

            const bb = this.csAddBillboard(
                billboards,
                bbOptions,
                layer,
                feature,
                olGeometry,
                style
            );
            if (opt_newBillboardCallback) {
                opt_newBillboardCallback(bb);
            }
        }.bind(this);

        if (image instanceof Image && !isImageLoaded(image)) {
            // Cesium requires the image to be loaded
            let cancelled = false;
            const source = layer.getSource();
            const canceller = function () {
                cancelled = true;
            };
            source.on(
                ["removefeature", "clear"],
                this.boundOnRemoveOrClearFeatureListener_
            );
            let cancellers = olcsUtil.obj(source)["olcs_cancellers"];
            if (!cancellers) {
                cancellers = olcsUtil.obj(source)["olcs_cancellers"] = {};
            }

            const fuid = getUid(feature);
            if (cancellers[fuid]) {
                // When the feature change quickly, a canceller may still be present so
                // we cancel it here to prevent creation of a billboard.
                cancellers[fuid]();
            }
            cancellers[fuid] = canceller;

            const listener = function () {
                image.removeEventListener("load", listener);
                if (!billboards.isDestroyed() && !cancelled) {
                    // Create billboard if the feature is still displayed on the map.
                    reallyCreateBillboard();
                }
            };

            image.addEventListener("load", listener);
        } else {
            reallyCreateBillboard();
        }
    }
}

export default customFeatureConverter;
