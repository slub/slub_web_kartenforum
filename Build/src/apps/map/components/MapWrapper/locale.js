/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "../../../../util/util.js";

export function getLocale() {
    return {
        "NavigationControl.ZoomIn": translate("control-zoom-in"),
        "NavigationControl.ZoomOut": translate("control-zoom-out"),
        "FullscreenControl.Enter": translate("control-fullscreen-Enter"),
        "FullscreenControl.Exit": translate("control-fullscreen-Exit"),
        "NavigationControl.ResetBearing": translate("control-rotate"),
        "TerrainControl.Enable": translate("control-toggleviewmode-title"),
        "TerrainControl.Disable": translate("control-toggleviewmode-title"),
        "GeolocateControl.FindMyLocation": translate("control-locateme-title"),
        "GeolocateControl.LocationNotAvailable": translate(
            "control-locateme-location-not-available"
        ),
    };
}
