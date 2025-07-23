/*
 * Created by tom.schulze@pikobytes.de on 06.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useRecoilCallback } from "recoil";
import { isDefined } from "@util/util";
import { mapState } from "@map/atoms";

const CSS_CLASS_POSITION_MODIFIER = "shifted";

export const CSS_CLASS_POSITION_CONTROL = "position-control";

export const SELECTORS = {
    topLeft: ".maplibregl-ctrl-top-left",
    topRight: ".maplibregl-ctrl-top-right",
    bottomRight: ".maplibregl-ctrl-bottom-right",
};

const addClassToMapControl = (selectors, map) => {
    for (const selector of Object.values(selectors)) {
        const element = map._controlContainer.querySelector(selector);
        element.classList.remove(CSS_CLASS_POSITION_MODIFIER);
        element.classList.add(CSS_CLASS_POSITION_MODIFIER);
    }
};

const removeClassFromMapControl = (selectors, map) => {
    for (const selector of Object.values(selectors)) {
        const element = map._controlContainer.querySelector(selector);
        element.classList.remove(CSS_CLASS_POSITION_MODIFIER);
    }
};

export const useMaplibreControlPositions = () => {
    // shifts inward towards center of screen
    const shiftLeft = useRecoilCallback(
        ({ snapshot }) =>
            async () => {
                const map = await snapshot.getPromise(mapState);

                if (isDefined(map)) {
                    const add = [SELECTORS.topLeft];
                    addClassToMapControl(add, map);
                }
            },
        []
    );

    // shifts inward towards center of screen
    const shiftRight = useRecoilCallback(
        ({ snapshot }) =>
            async () => {
                const map = await snapshot.getPromise(mapState);

                if (isDefined(map)) {
                    const add = [SELECTORS.topRight, SELECTORS.bottomRight];
                    addClassToMapControl(add, map);
                }
            },
        []
    );

    // shifts outward towards edge of screen
    const unShiftLeft = useRecoilCallback(
        ({ snapshot }) =>
            async () => {
                const map = await snapshot.getPromise(mapState);

                if (isDefined(map)) {
                    const remove = [SELECTORS.topLeft];
                    removeClassFromMapControl(remove, map);
                }
            },
        []
    );

    // shifts outward towards edge of screen
    const unShiftRight = useRecoilCallback(
        ({ snapshot }) =>
            async () => {
                const map = await snapshot.getPromise(mapState);

                if (isDefined(map)) {
                    const remove = [SELECTORS.topRight, SELECTORS.bottomRight];
                    removeClassFromMapControl(remove, map);
                }
            },
        []
    );

    // resets all shifts (w/ respect to HORIZONTAL_LAYOUT_MODE.STANDARD)
    const removeControlShifts = useRecoilCallback(
        ({ snapshot }) =>
            async () => {
                const map = await snapshot.getPromise(mapState);
                if (isDefined(map)) {
                    for (const selector of Object.values(SELECTORS)) {
                        const element =
                            map._controlContainer.querySelector(selector);
                        element.classList.remove(CSS_CLASS_POSITION_MODIFIER);
                    }
                }
            },
        []
    );

    return {
        shiftLeft,
        shiftRight,
        unShiftLeft,
        unShiftRight,
        removeControlShifts,
    };
};

export default useMaplibreControlPositions;
