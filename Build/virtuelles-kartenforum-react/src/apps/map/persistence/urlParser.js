/**
 * Created by nicolas.looschen@pikobytes.de on 17.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export const URL_VIEW_MODES = {
    "2D": 0,
    "3D": 1,
};

/**
 * Parse the view mode from the url
 * @param urlViewMode
 * @return {boolean|undefined}
 */
export const parseViewMode = (urlViewMode) => {
    if (urlViewMode === undefined) {
        return undefined;
    }

    return urlViewMode === URL_VIEW_MODES["3D"];
};

/**
 * Parse the url parameters to an internal map view representation
 * @param mapViewParams
 * @param is3dEnabled
 * @return {any}
 */
export const parseMapView = (mapViewParams, is3dEnabled) => {
    if (is3dEnabled) {
        const { d, p, ri, u } = mapViewParams;

        // only assign defined properties to the resulting mapview item
        return Object.assign(
            {},
            is3dArray(p) ? { position: array3dToPoint(p) } : null,
            is3dArray(d) ? { direction: array3dToPoint(d) } : null,
            is3dArray(u) ? { up: array3dToPoint(u) } : null,
            is3dArray(ri) ? { right: array3dToPoint(ri) } : null
        );
    } else {
        const { c, re, r, z } = mapViewParams;

        // only assign defined properties to the resulting mapview item
        return Object.assign(
            {},
            c === undefined ? null : { center: c },
            re === undefined ? null : { resolution: re },
            r === undefined ? null : { rotation: r },
            z === undefined ? null : { zoom: z }
        );
    }
};

/**
 * convert an array to a three dimensional point
 * @param arr
 * @return {{x: *, y: *, z: *}}
 */
const array3dToPoint = (arr) => {
    return {
        x: arr[0],
        y: arr[1],
        z: arr[2],
    };
};

/**
 * Check if an array represents a three dimensional point
 * @param el
 * @return {boolean}
 */
const is3dArray = (el) => {
    return el !== undefined && Array.isArray(el) && el.length === 3;
};
