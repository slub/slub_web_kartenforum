/*
 * Created by tom.schulze@pikobytes.de on 20.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { MAP_LIBRE_METADATA } from "../../constants";
import { GEOJSON_LAYER_TYPES, LAYER_DEFINITIONS } from "./constants";

export const createLayerConfig = (sourceId) => {
    const config = {};

    for (const key of Object.keys(GEOJSON_LAYER_TYPES)) {
        const layerType = GEOJSON_LAYER_TYPES[key];
        const layerId = `${sourceId}-${layerType}`;
        config[layerId] = {
            id: layerId,
            source: sourceId,
            metadata: {
                [MAP_LIBRE_METADATA.id]: sourceId,
            },
            ...LAYER_DEFINITIONS[layerType],
            layout: {
                ...LAYER_DEFINITIONS[layerType].layout,
                visibility: "visible",
            },
        };
    }

    return config;
};
