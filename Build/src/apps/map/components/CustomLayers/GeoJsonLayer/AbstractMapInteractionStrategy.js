/*
 * Created by tom.schulze@pikobytes.de on 21.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

class AbstractMapInteractionStrategy {
    constructor() {
        if (this.constructor === AbstractMapInteractionStrategy) {
            throw new Error(
                `Abstract class '${this.constructor}' cannot be instantiated.`
            );
        }
    }

    addLayerToMap() {
        throw new Error("Method 'addLayerToMap' must be implemented.");
    }

    removeLayerFromMap() {
        throw new Error("Method 'removeLayerFromMap' must be implemented.");
    }

    setDataOnMap() {
        throw new Error("Method 'setDataOnMap' must be implemented.");
    }

    getOpacity() {
        throw new Error("Method 'getOpacity' must be implemented.");
    }

    setOpacity() {
        throw new Error("Method 'setOpacity' must be implemented.");
    }

    isVisible() {
        throw new Error("Method 'isVisible' must be implemented.");
    }

    setVisibility() {
        throw new Error("Method 'setVisibility' must be implemented.");
    }

    isDisplayedInMap() {
        throw new Error("Method 'isDisplayedInMap' must be implemented.");
    }

    getLayerId() {
        throw new Error("Method 'getLayerId' must be implemented.");
    }

    move() {
        throw new Error("Method 'move' must be implemented.");
    }

    setFilters() {
        throw new Error("Method 'setFilters' must be implemented.");
    }

    resetFilters() {
        throw new Error("Method 'resetFilters' must be implemented.");
    }
}

export default AbstractMapInteractionStrategy;
