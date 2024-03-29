/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { FullScreen, Rotate, ScaleLine, Zoom } from "ol/control";

import SettingsProvider from "../SettingsProvider";
import CustomAttribution from "../apps/map/components/MapWrapper/components/CustomAttribution";
import LocateMeControl from "../components/Controls/LocateMeControl";
import ToggleViewMode from "../components/ToggleViewmode/ToggleViewmode";
import LayerSpy from "../components/Controls/LayerSpyControl";
import BasemapSelector from "../apps/map/components/Controls/BasemapSelectorControl";
import { MousePositionOnOff } from "../apps/map/components/MapWrapper/components/MousePositionOnOff";
import { LAYOUT_TYPES } from "../apps/map/layouts/util";
import PermalinkControl from "../apps/map/components/MapWrapper/components/PermalinkControl/PermalinkControl";

/*
 * ol does not export an inherits function in the current version
 * workaround from here: https://gis.stackexchange.com/questions/324606/ol-inherits-in-openlayers-6
 */
export function inherits(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
}

export function isDefined(el) {
    return el !== null && el !== undefined;
}

export function isString(el) {
    return typeof el === "string" || el instanceof String;
}

export function translate(key) {
    const dictionary = SettingsProvider.getLanguageDict();

    if (dictionary === undefined) {
        throw new Error("Dictionary is undefined.");
    }

    const translation = dictionary[key];

    if (translation === undefined) {
        console.warn(
            `Translation for key "${key}" was not found in dictionary.`
        );
        return "";
    } else {
        return translation;
    }
}

/**
 * Returns the default controls for the map view
 **/
export const getDefaultControls = (params) => {
    const {
        basemapSelectorProps,
        is3dActive,
        layout,
        onViewModeChange,
        permalinkProps,
        refSpyLayer,
    } = params;

    const defaultControls = [
        new CustomAttribution({ is3d: is3dActive }),
        new FullScreen({
            activeClassName: "active",
            tipLabel: translate("control-fullscreen-title"),
        }),
        new Rotate({
            className: "rotate-north ol-unselectable",
            tipLabel: translate("control-rotate"),
        }),
        new ScaleLine(),
        new ToggleViewMode({
            initialState: is3dActive,
            onViewModeChange,
        }),
        new LocateMeControl(),
        new BasemapSelector(basemapSelectorProps),
        new PermalinkControl({ is3dActive, ...permalinkProps }),
    ];

    if (layout === LAYOUT_TYPES.HORIZONTAL) {
        defaultControls.push(
            new Zoom({
                zoomInTipLabel: translate("control-zoom-in"),
                zoomOutTipLabel: translate("control-zoom-out"),
            }),
            new LayerSpy({
                refActiveBasemapId: permalinkProps.refActiveBasemapId,
                refSpyLayer,
            }),
            new MousePositionOnOff()
        );
    }

    return defaultControls;
};
