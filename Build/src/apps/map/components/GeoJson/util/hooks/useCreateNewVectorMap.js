/**
 * Created by nicolas.looschen@pikobytes.de on 27.11.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilCallback } from "recoil";
import {
    drawModePanelState,
    horizontalLayoutModeState,
    initialGeoJsonDrawState,
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

export const useCreateNewVectorMap = () => {
    return useRecoilCallback(({ set }) => async () => {
        // set up draw state
        set(initialGeoJsonDrawState, structuredClone(emptyFeatureCollection));
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
    });
};
