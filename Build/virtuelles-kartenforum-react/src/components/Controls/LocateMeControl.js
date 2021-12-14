/**
 * Created by jacob.mendt@pikobytes.de on 07.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { fromLonLat } from "ol/proj";
import { Control } from "ol/control";
import { translate } from "../../util/util";
import "./LocateMeControl.scss";

/**
 * requests the geolocation api and, in case of success, sets the coordinates for the mapview
 * @param {function} successCallback called in case the request succeeds
 * @param {function} errorCallback called in case the request fails
 */
const getCurrentPosition = (successCallback, errorCallback) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) =>
                successCallback({
                    center: [
                        position.coords.longitude,
                        position.coords.latitude,
                    ],
                    zoom: 12,
                }),
            errorCallback,
            {
                timeout: 2500,
            }
        );
    }
};

export class LocateMeControl extends Control {
    /**
     *
     * @param {{
     *     map: ol.Map,
     * }} options
     */
    constructor(options = {}) {
        const defaultClass = "ol-unselectable ol-control ol-locate-me";

        // Load default html and behavior
        const element = document.createElement("div");
        element.className = defaultClass;

        // Control button
        const button = document.createElement("button");
        button.title = translate("control-locateme-title");
        button.innerHTML = "G";
        button.type = "button";
        element.appendChild(button);

        // Container for the elements if control is active
        const contentContainer = document.createElement("div");
        contentContainer.className = "content-container";
        contentContainer.style.display = "none";
        element.appendChild(contentContainer);

        super({ element, target: options.target });

        // Add event listeners
        button.addEventListener("click", this.handleClickControl, false);
        button.addEventListener("touchstart", this.handleClickControl, false);
    }

    // Define the handler
    handleClickControl = () => {
        const map = this.getMap();

        getCurrentPosition(
            ({ center, zoom }) => {
                map.getView().animate({
                    center: fromLonLat(center, map.getView().getProjection()),
                    zoom: zoom,
                });
            },
            (e) => console.error(e)
        );
    };
}

export default LocateMeControl;
