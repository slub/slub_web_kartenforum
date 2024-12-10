/*
 * Created by tom.schulze@pikobytes.de on 10.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useRecoilCallback } from "recoil";
import { mapState } from "@map/atoms";
import { METADATA } from "@map/components/CustomLayers";

import {
    LAYERMANAGEMENT,
    SPATIALTEMPORALSEARCH,
} from "@map/components/PaginatingDataController/util";
import { isDefined } from "@util/util";

const OFFSET = { left: 10, right: 10, top: 50, bottom: 50 };

const PADDING = {
    left: SPATIALTEMPORALSEARCH.width + OFFSET.left,
    right: LAYERMANAGEMENT.width + OFFSET.right,
    top: OFFSET.top,
    bottom: OFFSET.bottom,
};

const FIT_TO_BOUNDS_OPTIONS = {
    padding: PADDING,
    animate: false,
};

const useZoomLayerToExtent = () => {
    const zoomToExtent = useRecoilCallback(
        ({ snapshot }) =>
            async (layer) => {
                const map = await snapshot.getPromise(mapState);

                if (isDefined(map)) {
                    const extent = layer.getMetadata(METADATA.bounds);
                    // add percentage based padding
                    //@TODO: Adjust for mobile layout
                    map.fitBounds(extent, FIT_TO_BOUNDS_OPTIONS);
                }
            },
        []
    );

    return { zoomToExtent };
};

export default useZoomLayerToExtent;
