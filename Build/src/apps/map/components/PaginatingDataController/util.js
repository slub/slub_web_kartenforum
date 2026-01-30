/**
 * Created by nicolas.looschen@pikobytes.de on 09/12/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { LAYOUT_TYPES } from "@map/layouts/util.js";
import { convex } from "@turf/convex";
import { featureCollection, point } from "@turf/helpers";
import SettingsProvider from "@settings-provider";

const PADDING = { height: 15, width: 15 };
const OFFSET = { height: 15, width: 0 };
export const SPATIALTEMPORALSEARCH = { width: 340 };
export const LAYERMANAGEMENT = { width: 340 };

/**
 * Calculate relevant search area of the screen in pixel sizes.
 *
 * @param {{map: {height: number, width: number}}} screenElementSizes
 * @param {string} layout
 * @param {number} zoom
 * @returns {Array<[number, number]>}
 */
export const getSearchExtentWithSamplingVertices = (
    screenElementSizes,
    layout,
    zoom
) => {
    const { map: mapSize } = screenElementSizes;
    const samplingCountVertices =
        zoom <= 2 ? 30 : zoom <= 3.5 ? 20 : zoom <= 5 ? 10 : 5;

    // 1.) First we calculate the corner coordinates of the visual boundingbox in screen coordinates. This is necessary because the map is partly overlayed, with other components, e.g. search list or layer controls. The relevant visual viewport differs therefor, from the actual map boundingbox.
    let lowX, lowY, highX, highY;

    // Calculate the corner coordinates
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

    // 2.) Between the corner points we add more vertices (sample points) to generate a grid. This grid can later be used, to produce better bounding polygons.
    const stepsX = (highX - lowX) / samplingCountVertices;
    const stepsY = (highY - lowY) / samplingCountVertices;
    const points = [];
    for (let i = 0; i < samplingCountVertices + 1; i++) {
        for (let j = 0; j < samplingCountVertices + 1; j++) {
            points.push([
                Math.round(lowX + i * stepsX),
                Math.round(lowY + j * stepsY),
            ]);
        }
    }
    return points;
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

/**
 * Creates a set of GeoJSON features representing a search area, based on a set of given inputs points (in screen coordinates) representing the area.
 *
 * @param {Array<[number, number]>} pointsPixel
 * @param {maplibregl.Map} map
 * @param {boolean} debug
 * @returns {Array<[number, number]>}
 */
export function mapPointsToSearchPolygons(pointsPixel, map) {
    // Transform the points in screen coordinates to WGS84 coordinates
    const pointsWGS84 = pointsPixel.map((p) => {
        return map.unproject(p).wrap().toArray();
    });

    // Create a feature collection. In case we are debugging, we also return the points for better interpretation of data.
    const features = [];

    // Groups the given points into two groups in case we detect antimeridian crossing.
    const pointsWGS84Grouped = _splitByAntimeridian(pointsWGS84);

    if (SettingsProvider.isDebug()) {
        // Create points features. We just need them for debugging reasons.
        pointsWGS84Grouped.forEach((group) => {
            group.forEach((p) => {
                features.push({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: p,
                    },
                });
            });
        });
    }

    // Create the polygons. In case we have to groups, because of antimeridian crossing, we create two polygons.
    pointsWGS84Grouped.forEach((group) => {
        const polygon = convex(featureCollection(group.map((p) => point(p))));
        features.push(polygon);
    });

    return features;
}

/**
 * Functions takes an array of lon, lat points and splits them into two groups if they overlap the antimeridian.
 *
 * @param {Array<[number, number]>} points
 * @returns {Array<Array<[number, number]>>}
 */
function _splitByAntimeridian(points) {
    // Simple heuristic for detecting if the given points array is affected by antimeridian crossing
    // points = [[lon, lat], ...] in WGS84
    const lons = points.map((p) => p[0]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const isCrossing = maxLon - minLon > 180;
    // console.log("IsCrossing: ", isCrossing, " MinLon: ", minLon, " MaxLon: ", maxLon);

    if (!isCrossing) {
        // No split is needed
        return [points];
    }

    // In case it is crossing we use a simple approach, which groups all coordinates with a longitude value larger 0
    // into one group and all with longitude value smaller 0 into another group.
    const groupEasterHemisphere = points.filter((p) => p[0] >= 0);
    const groupWestHemisphere = points.filter((p) => p[0] < 0);
    return [groupWestHemisphere, groupEasterHemisphere];
}
