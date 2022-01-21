/**
 * Created by nicolas.looschen@pikobytes.de on 09/12/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

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
