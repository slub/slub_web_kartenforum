/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

const EARTH_RADIUS = 6378137.0;
const DEFAULT_PITCH = 50;

export const areLegacyMapViewParams = (mapViewParams) => {
    return (
        // r => rotation now bearing
        mapViewParams.r !== undefined ||
        // d => direction (vector)
        mapViewParams.d !== undefined ||
        // ri => right
        mapViewParams.ri !== undefined ||
        // u => up (vector)
        mapViewParams.u !== undefined
    );
};

export const isLegacyMapView = (mapView) => {
    return (
        mapView.rotation !== undefined ||
        mapView.direction !== undefined ||
        mapView.right !== undefined ||
        mapView.up !== undefined
    );
};

export const parseLegacyMapViewParams = (mapViewParams) => {
    const { c, r, d, u, p, z } = mapViewParams;
    return Object.assign(
        {},
        c === undefined ? null : { center: c },
        r === undefined ? null : { rotation: r },
        z === undefined ? null : { zoom: z },
        p === undefined ? null : { position: p },
        d === undefined ? null : { direction: d },
        u === undefined ? null : { up: u }
    );
};

// For 3d views, we need to estimate the zoom level based on the position
// but the effort to restore the precise view is too big
const extractInformationFromPositionVector = (position) => {
    const [x, y, z] = position;
    const zoom = Math.log2(EARTH_RADIUS / z) + 6;

    return {
        center: [x, y],
        pitch: DEFAULT_PITCH,
        zoom,
    };
};

const estimateBearing = (position, direction) => {
    // Estimate bearing (angle of direction projected on horizontal plane)
    const bearing = calculateBearing(direction);

    return { bearing, legacy3dMapView: true };
};

const radiansToDegrees = (rads) => rads * (180 / Math.PI);

const calculateBearing = (dir) => {
    const angleInRads = Math.PI + (Math.atan2(dir[0], dir[1]) - Math.PI / 2);
    return radiansToDegrees(angleInRads);
};

export function convertLegacyMapViewToCameraOptions(mapView) {
    const { center, rotation, direction, position, zoom } = mapView;

    return Object.assign(
        {},
        center === undefined ? null : { center },
        rotation === undefined ? null : { pitch: radiansToDegrees(rotation) },
        zoom === undefined ? null : { zoom },
        position === undefined
            ? null
            : extractInformationFromPositionVector(position),
        direction === undefined || position === undefined
            ? null
            : estimateBearing(position, direction)
    );
}
