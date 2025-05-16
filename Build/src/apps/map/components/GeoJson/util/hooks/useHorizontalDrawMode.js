/*
 * Created by nicolas.looschen@pikobytes.de on 27.11.2024.
 * Restructured to new file by tom.schulze@pikobytes.de on 08.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useRecoilCallback } from "recoil";
import {
    drawModePanelState,
    horizontalLayoutModeState,
    initialGeoJsonDrawState,
    mapState,
    metadataDrawState,
    vectorMapDrawState,
} from "@map/atoms";
import {
    DRAW_MODE_PANEL_STATE,
    HORIZONTAL_LAYOUT_MODE,
} from "@map/layouts/util";
import {
    emptyFeatureCollection,
    VECTOR_MAP_TYPES,
} from "@map/components/GeoJson/constants";
import { isDefined } from "@util/util";
import { METADATA } from "@map/components/CustomLayers";

export const useHorizontalDrawMode = () => {
    const createNewVectorMap = useRecoilCallback(
        ({ set }) =>
            async () => {
                // set up draw state
                set(
                    initialGeoJsonDrawState,
                    structuredClone(emptyFeatureCollection)
                );
                set(metadataDrawState, {});
                set(vectorMapDrawState, {
                    type: VECTOR_MAP_TYPES.REMOTE,
                    id: null,
                    layerRole: "owner",
                });

                // switch to draw mode
                set(horizontalLayoutModeState, HORIZONTAL_LAYOUT_MODE.DRAW);

                // open metadata panel
                set(drawModePanelState, DRAW_MODE_PANEL_STATE.METADATA);
            },
        []
    );

    const editVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async (selectedLayer) => {
                const map = await snapshot.getPromise(mapState);

                if (!isDefined(map) || !isDefined(selectedLayer)) {
                    throw new Error(
                        "Cannot switch to draw mode. Map or layer not defined."
                    );
                }

                if (selectedLayer.isExternalVectorMap()) {
                    throw new Error(
                        "Cannot switch to draw mode. External vector maps are not supported."
                    );
                }

                // hide the layer, mapbox draw takes over displaying the geojson
                selectedLayer.setVisibility(map, "none");

                set(initialGeoJsonDrawState, selectedLayer.getGeoJson());
                set(metadataDrawState, {
                    [METADATA.title]: selectedLayer.getMetadata(METADATA.title),
                    [METADATA.description]: selectedLayer.getMetadata(
                        METADATA.description
                    ),
                    [METADATA.thumbnailUrl]: selectedLayer.getMetadata(
                        METADATA.thumbnailUrl
                    ),
                    [METADATA.timePeriod]: selectedLayer.getMetadata(
                        METADATA.timePeriod
                    ),
                });

                const vectorMapId = selectedLayer.getMetadata(
                    METADATA.vectorMapId
                );
                const version = selectedLayer.getMetadata(METADATA.version);

                set(vectorMapDrawState, {
                    type: vectorMapId ? "remote" : "local",
                    id: vectorMapId ?? null,
                    version: version ?? null,
                    layerRole:
                        selectedLayer.getMetadata(METADATA.userRole) ?? null,
                });
                set(horizontalLayoutModeState, HORIZONTAL_LAYOUT_MODE.DRAW);
            },
        []
    );

    return { createNewVectorMap, editVectorMap };
};
