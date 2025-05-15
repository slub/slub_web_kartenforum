/**
 * Created by nicolas.looschen@pikobytes.de on 17.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { LAYER_TYPES } from "@map/components/CustomLayers";
import { fetchWmsTmsSettings } from "@map/components/CustomLayers/HistoricMapLayer/fetchWmsTmsSettings";
import { queryDocument } from "@util/apiEs";
import { readLayer } from "@util/parser";
import { deserializeGeojsonLayer } from "@map/persistence/util";
import { isDefined } from "@util/util";
import { initializeVectorMap } from "@map/components/GeoJson/util/initializeVectorMap";

const layerTypes = Object.values(LAYER_TYPES);

export async function loadLayer(operationalLayer) {
    const { id, type, isVisible, opacity, ...rest } = operationalLayer;

    const visibility = isVisible ? "visible" : "none";
    const layerSettings = { visibility, opacity };

    if (!layerTypes.includes(type)) {
        console.error("Unknown layer type: ", type);
        throw new Error(`Layer type "${type}" not supported`);
    }

    // Backwards compatibility for restoring legacy geojson map views
    if (type === LAYER_TYPES.LEGACY_GEOJSON) {
        return {
            layer: deserializeGeojsonLayer(rest),
            settings: { layerSettings },
        };
    }

    // 'Local' vector map layer -> content persistence
    if (type === LAYER_TYPES.VECTOR_MAP && !isDefined(id)) {
        if (!isDefined(rest.properties) || !isDefined(rest.geojson)) {
            throw new Error(
                "Cannot restore local vector map layer without geojson or properties"
            );
        }

        return {
            layer: deserializeGeojsonLayer(rest),
            settings: { layerSettings },
        };
    }

    // Remote layers -> vector map or historic map

    if (!isDefined(id)) {
        throw new Error("Cannot restore remote layers with missing id");
    }

    const document = await queryDocument(id);
    const layer = readLayer(id, document);

    const resultBase = { layer, settings: { layerSettings } };

    if (type === LAYER_TYPES.HISTORIC_MAP) {
        resultBase.settings.sourceSettings = await fetchWmsTmsSettings(layer);
    }

    if (type === LAYER_TYPES.VECTOR_MAP) {
        await initializeVectorMap(layer);
    }

    return resultBase;
}
