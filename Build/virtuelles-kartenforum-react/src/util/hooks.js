/**
 * Created by jacob.mendt@pikobytes.de on 18.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useEffect, useState } from "react";

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
