/*
 * Created by tom.schulze@pikobytes.de on 11.09.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import {
    bindAll,
    DOMcreate,
    DOMremove,
} from "@map/components/MapWrapper/tools.js";
import { VKF_GLOBE_MODE_CHANGE_EVENT } from "../VkfMap/MapWithTerrainBehavior";

/**
 * A globe control that triggers the "VKF Globe Mode".
 */
export class VkfGlobeModeControl {
    _map;
    _container;
    _button;

    constructor() {
        bindAll(["_toggleState", "_updateIcon", "_toggleProjection"], this);
    }

    onAdd(map) {
        this._map = map;
        this._container = DOMcreate(
            "div",
            "maplibregl-ctrl maplibregl-ctrl-group"
        );
        this._button = DOMcreate(
            "button",
            "maplibregl-ctrl-terrain",
            this._container
        );
        DOMcreate("span", "maplibregl-ctrl-icon", this._button).setAttribute(
            "aria-hidden",
            "true"
        );
        this._button.type = "button";
        this._button.addEventListener("click", this._toggleState);

        this._updateIcon();
        this._map.on(VKF_GLOBE_MODE_CHANGE_EVENT, this._updateIcon);
        return this._container;
    }

    onRemove() {
        DOMremove(this._container);
        this._map.off(VKF_GLOBE_MODE_CHANGE_EVENT, this._updateIcon);

        // @ts-expect-error: map will only be undefined on remove
        this._map = undefined;
    }

    _isVkfGlobeModeEnabled() {
        return this._map.isVkfGlobeModeEnabled();
    }

    _toggleState() {
        if (this._isVkfGlobeModeEnabled()) {
            this._map.disableVkfGlobeMode();
        } else {
            this._map.enableVkfGlobeMode();
        }

        this._updateIcon();
    }

    _updateIcon() {
        this._button.classList.remove("maplibregl-ctrl-vkf-globe-mode");
        this._button.classList.remove("maplibregl-ctrl-vkf-globe-mode-enabled");

        if (this._isVkfGlobeModeEnabled()) {
            this._button.classList.add(
                "maplibregl-ctrl-vkf-globe-mode-enabled"
            );
            this._button.title = this._map._getUIString(
                "VkfGlobeModeControl.Disable"
            );
        } else {
            this._button.classList.add("maplibregl-ctrl-vkf-globe-mode");
            this._button.title = this._map._getUIString(
                "VkfGlobeModeControl.Enable"
            );
        }
    }
}
