/*
 * Created by tom.schulze@pikobytes.de on 10.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useRecoilCallback } from "recoil";
import { layoutState, mapState } from "@map/atoms";
import { METADATA } from "@map/components/CustomLayers";

import {
    LAYERMANAGEMENT,
    SPATIALTEMPORALSEARCH,
} from "@map/components/PaginatingDataController/util";
import { isDefined } from "@util/util";
import { LAYOUT_TYPES } from "@map/layouts/util";

const SCREEN_PANEL_GAP = 24;
const EXTRA_PADDING = 100;

const PADDING_HORIZONTAL = {
    left: SCREEN_PANEL_GAP + SPATIALTEMPORALSEARCH.width + EXTRA_PADDING,
    right: SCREEN_PANEL_GAP + LAYERMANAGEMENT.width + EXTRA_PADDING,
    top: 60, // SCREEN_PANEL_GAP + marker image height
    bottom: SCREEN_PANEL_GAP,
};

const PADDING_VERTICAL = {
    left: 50,
    right: 50,
    top: 75, // top control
    bottom: 150, // layer mangagement button,
};

const getOptions = (layout) => ({
    padding:
        layout === LAYOUT_TYPES.HORIZONTAL
            ? PADDING_HORIZONTAL
            : PADDING_VERTICAL,
    animate: false,
});

const useZoomLayerToExtent = () => {
    const zoomToExtent = useRecoilCallback(
        ({ snapshot }) =>
            async (layer) => {
                const map = await snapshot.getPromise(mapState);
                const layout = await snapshot.getPromise(layoutState);
                const options = getOptions(layout);

                if (isDefined(map)) {
                    const extent = layer.getMetadata(METADATA.bounds);
                    map.fitBounds(extent, options);
                }
            },
        []
    );

    return { zoomToExtent };
};

export default useZoomLayerToExtent;
