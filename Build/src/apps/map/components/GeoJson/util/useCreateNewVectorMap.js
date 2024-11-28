/**
 * Created by nicolas.looschen@pikobytes.de on 27.11.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilCallback } from "recoil";
import { initialGeoJsonDrawState, horizontalLayoutModeState } from "@map/atoms";
import { HORIZONTAL_LAYOUT_MODE } from "@map/layouts/util";

const emptyFeatureCollection = {
    type: "FeatureCollection",
    features: [],
};

export const useCreateNewVectorMap = () => {
    return useRecoilCallback(({ set }) => async () => {
        set(initialGeoJsonDrawState, structuredClone(emptyFeatureCollection));
        set(horizontalLayoutModeState, HORIZONTAL_LAYOUT_MODE.DRAW);
    });
};
