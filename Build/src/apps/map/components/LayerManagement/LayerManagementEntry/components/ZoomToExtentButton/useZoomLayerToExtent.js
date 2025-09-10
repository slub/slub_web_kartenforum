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
import { LngLatBounds } from "maplibre-gl";

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

const OPTIONS_MOSAIC = {
    padding: {
        left:
            SCREEN_PANEL_GAP + SPATIALTEMPORALSEARCH.width * 2 + EXTRA_PADDING,
        right: EXTRA_PADDING,
        top: SCREEN_PANEL_GAP,
        bottom: SCREEN_PANEL_GAP,
    },
    animate: false,
};

const getExtent = (layers) => {
    let coercedLayers = layers;

    if (!Array.isArray(layers)) {
        coercedLayers = [layers];
    }

    let boundingExtent = null;
    for (const layer of coercedLayers) {
        const bounds = layer.getMetadata(METADATA.bounds);
        if (!isDefined(boundingExtent)) {
            boundingExtent = new LngLatBounds(bounds);
            continue;
        }

        boundingExtent.extend(bounds);
    }

    return boundingExtent;
};

const useZoomLayerToExtent = () => {
    const zoomToExtent = useRecoilCallback(
        ({ snapshot }) =>
            async (layers) => {
                const map = await snapshot.getPromise(mapState);
                const layout = await snapshot.getPromise(layoutState);
                const options = getOptions(layout);

                if (isDefined(map)) {
                    const extent = getExtent(layers);
                    map.fitBounds(extent, options);
                }
            },
        []
    );

    // there's no clear state that distinguishes mosaic-map layout from standard map layout
    // this could be refactored
    const zoomToExtentMosaicMap = useRecoilCallback(
        ({ snapshot }) =>
            async (layers) => {
                const map = await snapshot.getPromise(mapState);

                if (isDefined(map)) {
                    const extent = getExtent(layers);
                    map.fitBounds(extent, OPTIONS_MOSAIC);
                }
            },
        []
    );

    return { zoomToExtent, zoomToExtentMosaicMap };
};

export default useZoomLayerToExtent;
