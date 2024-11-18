/**
 * Created by nicolas.looschen@pikobytes.de on 09/12/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { LAYOUT_TYPES } from "@map/layouts/util.js";

const PADDING = { height: 15, width: 15 };
const OFFSET = { height: 15, width: 0 };
const SPATIALTEMPORALSEARCH = { width: 340 };
const LAYERMANAGEMENT = { width: 340 };

/**
 * Calculate relevant search area of the screen in pixel sizes
 * @param sceenElementSizes
 * @param layout
 * @return {[[number,number],[number,number]]}
 */
export const getSearchExtent = (sceenElementSizes, layout) => {
    const { map: mapSize } = sceenElementSizes;

    let lowX, lowY, highX, highY;

    // calculate pixelextent
    if (layout === LAYOUT_TYPES.VERTICAL) {
        // do not add padding or other parameters on mobile devices
        lowX = 0;
        lowY = mapSize.height;
        highX = mapSize.width;
        highY = 0;
    } else {
        // only use the relevant search area inbetween spatialtemporalsearch and layermanagement
        lowX = 0 + SPATIALTEMPORALSEARCH.width + PADDING.width;
        lowY = mapSize.height - OFFSET.height - PADDING.height;
        highX = mapSize.width - LAYERMANAGEMENT.width - PADDING.width;
        highY = OFFSET.height + PADDING.height;
    }

    return [
        [lowX, lowY],
        [lowX, highY],
        [highX, lowY],
        [highX, highY],
    ];
};

export const limitExtent = (
    extent,
    limits = [
        [-180, 85.06],
        [180, -85.06],
    ]
) => {
    const [[minX, maxY], [maxX, minY]] = extent;

    const [[limitMinX, limitMaxY], [limitMaxX, limitMinY]] = limits;

    return [
        [Math.max(limitMinX, minX), Math.min(maxY, limitMaxY)],
        [Math.min(limitMaxX, maxX), Math.max(minY, limitMinY)],
    ];
};
