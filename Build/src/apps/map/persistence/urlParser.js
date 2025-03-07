/**
 * Created by nicolas.looschen@pikobytes.de on 17.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { isDefined } from "@util/util.js";
import {
    convertLegacyMapViewToCameraOptions,
    areLegacyMapViewParams,
    parseLegacyMapViewParams,
} from "./backwardsCompatibility.js";

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
 * @param cameraParams
 * @return {any}
 */
export const parseCameraOptions = (cameraParams) => {
    // backwards compatibility layer
    if (areLegacyMapViewParams(cameraParams)) {
        const mapView = parseLegacyMapViewParams(cameraParams);

        return convertLegacyMapViewToCameraOptions(mapView);
    }

    const { c, be, p, z } = cameraParams;

    return Object.assign(
        {},
        c === undefined ? null : { center: c },
        be === undefined ? null : { bearing: be },
        p === undefined ? null : { pitch: p },
        z === undefined ? null : { zoom: z }
    );
};

/**
 * Parse the url params for the feature identifier
 * @param urlParams
 * @returns {{ featureId: number, sourceId: string } | undefined}
 */
export const parseFeatureIdentifier = (urlParams) => {
    const { fid, foid } = urlParams;

    if (!isDefined(fid) || !isDefined(foid)) {
        return undefined;
    }

    const parsedFid = Number.parseInt(fid);

    if (Number.isNaN(parsedFid)) {
        return undefined;
    }

    return {
        featureId: parsedFid,
        sourceId: foid,
    };
};
