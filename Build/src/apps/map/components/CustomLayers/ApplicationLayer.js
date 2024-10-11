/*
 * Created by tom.schulze@pikobytes.de on 11.09.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

/**
 * Abstract Class ApplicationLayer.
 *
 * Geometry = envelope from search index
 * @class ApplicationLayer
 */

import { isDefined } from "@util/util";
import { METADATA } from "./constants";

export class ApplicationLayer {
    metadata = {};
    geometry = {};

    constructor({ metadata, geometry }) {
        if (this.constructor === ApplicationLayer) {
            throw new Error(
                `Abstract class '${this.constructor}' cannot be instantiated.`
            );
        }

        this.metadata = metadata;
        this.geometry = geometry;
    }

    getGeometry() {
        return this.geometry;
    }

    getId() {
        return this.metadata.id;
    }

    getMetadata(key) {
        if (isDefined(key)) {
            return this.metadata[key];
        }

        return this.metadata;
    }

    updateMetadata(key, value) {
        if (!isDefined(key) || !isDefined(value)) {
            console.warn(`Trying to update metadata without key or value`);
            return;
        }

        if (!isDefined(METADATA[key])) {
            console.warn(`Trying to update metadata with invalid key '${key}'`);
            return;
        }

        this.metadata[key] = value;
    }

    isDisplayedInMap() {
        throw new Error("Method 'isDisplayedInMap' must be implemented.");
    }

    getType() {
        throw new Error("Method 'getType' must be implemented.");
    }

    setOpacity() {
        throw new Error("Method 'setOpacity' must be implemented.");
    }

    getOpacity() {
        throw new Error("Method 'getOpacity' must be implemented.");
    }

    moveToTop() {
        throw new Error("Method 'moveToTop' must be implemented.");
    }

    // move(map, beforeLayer)
    move() {
        throw new Error("Method 'move' must be implemented.");
    }

    getMapLibreLayerId() {
        throw new Error("Method 'getMapLibreLayerId' must be implemented.");
    }

    removeLayer() {
        throw new Error("Method 'removeLayer' must be implemented.");
    }

    setVisibility() {
        throw new Error("Method 'setVisibility' must be implemented.");
    }

    isVisible() {
        throw new Error("Method 'isVisible' must be implemented.");
    }

    serialize() {
        throw new Error("Method 'serialize' must be implemented.");
    }
}
