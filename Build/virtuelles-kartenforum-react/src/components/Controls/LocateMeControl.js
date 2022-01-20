/**
 * Created by jacob.mendt@pikobytes.de on 07.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { fromLonLat } from "ol/proj";
import { Control } from "ol/control";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";
import { translate } from "../../util/util";
import markerImg from "./LocateMeMarker.png";
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
                const position = fromLonLat(
                    center,
                    map.getView().getProjection()
                );

                // Place marker at the position
                const markerLayer = new VectorLayer({
                    source: new VectorSource({
                        features: [
                            new Feature({
                                geometry: new Point(position),
                            }),
                        ],
                    }),
                    style: () => [
                        new Style({
                            image: new Icon({
                                anchor: [0.5, 1],
                                src: markerImg,
                                imgSize: [240, 240],
                                scale: 1 / 7,
                            }),
                        }),
                    ],
                });
                markerLayer.set("altitudeMode", "clampToGround");
                map.addLayer(markerLayer);

                // Center map
                map.getView().animate({
                    center: position,
                    zoom: zoom,
                });

                // Clean up after a 10 seconds
                setTimeout(() => {
                    map.removeLayer(markerLayer);
                }, 10000);
            },
            (e) => console.error(e)
        );
    };
}

export default LocateMeControl;
