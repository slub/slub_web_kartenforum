/*
 * Created by tom.schulze@pikobytes.de on 08.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */
import { useRecoilCallback } from "recoil";
import {
    vectorMapExternalModePanelState,
    horizontalLayoutModeState,
    mapState,
    layerExternalVectorMapState,
} from "@map/atoms";
import {
    HORIZONTAL_LAYOUT_MODE,
    VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE,
} from "@map/layouts/util";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";
import { emptyFeatureCollection } from "../../constants";
import { isDefined } from "@util/util";

export const NEW_EXTERNAL_LAYER_ID = "unsaved_external_layer";

export const isNewExternalVectorMap = (layerId) => {
    return layerId === NEW_EXTERNAL_LAYER_ID;
};

export const useHorizontalExternalVectorMapMode = () => {
    const createNewExternalVectorMap = useRecoilCallback(
        ({ set, snapshot }) =>
            async () => {
                const map = await snapshot.getPromise(mapState);

                if (!isDefined(map)) {
                    throw new Error(
                        "Cannot switch to external vector map mode. Map is not defined."
                    );
                }

                const temporaryLayer = GeoJsonLayer.fromApplication({
                    metadata: { [METADATA.id]: NEW_EXTERNAL_LAYER_ID },
                    geoJson: structuredClone(emptyFeatureCollection),
                });
                temporaryLayer.addLayerToMap(map);

                set(layerExternalVectorMapState, temporaryLayer);

                // switch to external vector map mode
                set(
                    horizontalLayoutModeState,
                    HORIZONTAL_LAYOUT_MODE.VECTOR_MAP_EXTERNAL
                );

                // open metadata panel
                set(
                    vectorMapExternalModePanelState,
                    VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE.METADATA
                );
            },
        []
    );

    const editExternalVectorMap = useRecoilCallback(
        ({ set, snapshot }) =>
            async (selectedLayer) => {
                const map = await snapshot.getPromise(mapState);

                if (!isDefined(map) || !isDefined(selectedLayer)) {
                    throw new Error(
                        "Cannot switch to external vector map mode. Map or layer is not defined."
                    );
                }

                const metadata = selectedLayer.getMetadata();
                const geoJson = selectedLayer.getGeoJson();
                const tempId = `${metadata[METADATA.id]}-temp`;

                const temporaryLayer = GeoJsonLayer.fromApplication({
                    metadata: { ...metadata, [METADATA.id]: tempId },
                    geoJson: structuredClone(geoJson),
                });
                temporaryLayer.addLayerToMap(map);

                // hide the original layer
                selectedLayer.setVisibility(map, "none");

                set(layerExternalVectorMapState, temporaryLayer);

                // open metadata panel
                set(
                    vectorMapExternalModePanelState,
                    VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE.METADATA
                );
                set(
                    horizontalLayoutModeState,
                    HORIZONTAL_LAYOUT_MODE.VECTOR_MAP_EXTERNAL
                );
            },
        []
    );

    return { createNewExternalVectorMap, editExternalVectorMap };
};
