/**
 * Created by jacob.mendt@pikobytes.de on 18.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useEffect, useLayoutEffect, useState } from "react";
import useResizeObserver from "@react-hook/resize-observer";
import { useSetRecoilState } from "recoil";

import { elementsScreenSizeState } from "../apps/map/atoms/atoms";

/**
 * Hook for preserving the previous state.
 *
 * @param {*} value
 * @param {string} lookup
 * @returns {*}
 */
export function usePrevious(value) {
    const [prevData, setPrevData] = useState(value);
    useEffect(() => {
        setPrevData(value);
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)
    return prevData;
}

/**
 * Custom hook to persist element screen sizes to the defined recoil state
 * @param target
 * @param id
 */
export function useSetElementScreenSize(target, id) {
    const setElementsScreenSize = useSetRecoilState(elementsScreenSizeState);
    const size = useSize(target);

    useEffect(() => {
        const { height, width } = size;
        setElementsScreenSize((oldState) =>
            Object.assign({}, oldState, { [id]: { height, width } })
        );
    }, [size]);
}

/**
 * Determines size of an element
 * based on https://www.npmjs.com/package/@react-hook/resize-observer
 * @param target
 * @return {*}
 */
export const useSize = (target) => {
    const [size, setSize] = useState({ height: 0, width: 0 });

    useLayoutEffect(() => {
        setSize(target.current.getBoundingClientRect());
    }, [target]);

    // Where the magic happens
    useResizeObserver(target, (entry) => setSize(entry.contentRect));
    return size;
};
