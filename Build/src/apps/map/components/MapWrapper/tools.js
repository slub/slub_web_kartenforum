/**
 * Created by nicolas.looschen@pikobytes.de on 06.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/util.ts#L223
export function bindAll(fns, context) {
    for (const fn of fns) {
        if (typeof context[fn] !== "function") continue;
        context[fn] = context[fn].bind(context);
    }
}

// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/dom.ts#L22
export function DOMcreate(tagName, className, container) {
    const el = window.document.createElement(tagName);
    if (className !== undefined) el.className = className;
    if (container) container.appendChild(el);
    return el;
}

// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/dom.ts#L111
export function DOMremove(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
