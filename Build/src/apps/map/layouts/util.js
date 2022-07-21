/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export const LAYOUT_TYPES = {
    HORIZONTAL: "HORIZONTAL",
    VERTICAL: "VERTICAL",
    // depending on implementation use TABLE_PORTRAIT/TABLET_HORIZONTAL
    // separately
};

// Specify layout breakpoints
// based on https://www.w3schools.com/howto/howto_css_media_query_breakpoints.asp
export const BREAKPOINTS = {
    EXTRA_SMALL: 600, // max size for phones
    SMALL: 600, // min size for portrait templates
    MEDIUM: 768, // mmin size for landscape templates
    LARGE: 992, // min size for desktop
};

/**
 * Returns the layout depending on the specified breakpoints
 * @param {number} width - width of the window
 * @returns {LAYOUT_TYPES} - type of the layout to be used
 */
export const getLayoutForWidth = (width) => {
    if (width >= BREAKPOINTS.LARGE) {
        return LAYOUT_TYPES.HORIZONTAL;
    } else {
        return LAYOUT_TYPES.VERTICAL;
    }
};

/**
 * Generates classnames for the map div depending on the layout
 *
 * @param {LAYOUT_TYPES} layout - current layout
 * @returns {string} classname for the map div
 */
export const getMapClassNameForLayout = (layout) => {
    switch (layout) {
        case LAYOUT_TYPES.HORIZONTAL:
        default:
            return "ol-map-large";
        case LAYOUT_TYPES.VERTICAL:
            return "ol-map-small";
    }
};
