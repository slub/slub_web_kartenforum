/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export function flyToAsync(map, options) {
    return new Promise(function (myResolve) {
        const onAbort = () => {
            myResolve(false);
        };

        const cancelAbort = () => {
            options.signal.removeEventListener("abort", onAbort);
        };

        options.signal.addEventListener("abort", onAbort, { once: true });

        map.once("moveend", () => {
            myResolve(true);
            cancelAbort();
        });

        map.once("touchstart", () => {
            myResolve(false);
            cancelAbort();
        });

        map.once("mousedown", () => {
            myResolve(false);
            cancelAbort();
        });

        map.flyTo(options);
    });
}

export function sleepAsync(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
