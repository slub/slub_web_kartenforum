/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import SettingsProvider from "@settings-provider";
import BasemapSelectorControl from "@map/components/Controls/BasemapSelectorControl";
import { MousePositionOnOff } from "@map/components/MapWrapper/components/MousePositionOnOff";
import PermalinkControl from "@map/components/Controls/PermalinkControl.jsx";
import {
    FullscreenControl,
    GeolocateControl,
    NavigationControl,
    ScaleControl,
    AttributionControl,
} from "maplibre-gl";
import { TerrainControl } from "@map/components/Controls/TerrainControl.jsx";

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
export const getDefaultControls = () => {
    const defaultControls = [
        // new CustomAttribution({ is3d: is3dActive }),
        {
            position: "top-left",
            control: new NavigationControl({
                showZoom: true,
                showCompass: false,
                visualizePitch: false,
            }),
        },
        { position: "top-left", control: new FullscreenControl() },

        {
            position: "top-left",
            control: new NavigationControl({
                showZoom: false,
                showCompass: true,
                visualizePitch: true,
            }),
        },
        {
            position: "top-left",
            control: new MousePositionOnOff(),
        },
        { position: "top-left", control: new TerrainControl() },
        { position: "top-left", control: new BasemapSelectorControl() },
        {
            position: "top-left",
            control: new GeolocateControl({ trackUserLocation: true }),
        },
        {
            position: "top-left",
            control: new PermalinkControl(),
        },
        {
            position: "bottom-right",
            control: new AttributionControl({ compact: true }),
        },
        {
            position: "bottom-right",
            control: new ScaleControl({ maxWidth: 137 }),
        },
    ];

    return defaultControls;
};
