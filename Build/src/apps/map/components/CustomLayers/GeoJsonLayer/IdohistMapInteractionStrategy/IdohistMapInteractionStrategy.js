/*
 * Created by tom.schulze@pikobytes.de on 21.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined } from "@util/util";
import AbstractMapInteractionStrategy from "../AbstractMapInteractionStrategy";

// TODO Consider using a source layer to load all hover polygons and toggle them on off via feature-state.
// TODO adapt layer management to handle layers that draw on the DOM instead of the canvas?

/**
 * Handles geojson that represents the IDOHIST specification.
 * The geojson is expected to be a FeatureCollection consisting of Point features only.
 */
class IdohistMapInteractionStrategy extends AbstractMapInteractionStrategy {
    #markers = [];

    constructor() {
        super();
    }

    addLayerToMap(map, settings, geojson) {
        if (!isDefined(map)) {
            return;
        }

        console.log(settings, geojson);
    }

    removeLayerFromMap(map) {
        console.log(map);
    }

    setDataOnMap(map, geoJson) {
        console.log(map, geoJson);
    }

    getOpacity(map) {
        console.log(map);
    }

    setOpacity(map, opacity) {
        console.log(map, opacity);
    }

    isVisible(map) {
        console.log(map);
    }

    setVisibility(map, visibility) {
        console.log(map, visibility);
    }

    isDisplayedInMap(map) {
        console.log(map);
    }

    // TODO check if maplibre actually needs a dummy layer when moving the map in the layer management
    getLayerId() {
        console.log("getLayerIds()");
    }

    move(map, beforeLayer) {
        console.log(map, beforeLayer);
    }

    setFilters(map, filterValues) {
        console.log(map, filterValues);
    }

    resetFilters(map) {
        console.log(map);
    }
}

export default IdohistMapInteractionStrategy;
