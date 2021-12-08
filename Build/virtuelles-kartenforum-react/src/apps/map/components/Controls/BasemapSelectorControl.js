/**
 * Created by jacob.mendt@pikobytes.de on 07.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import ReactDOM from "react-dom";
import { Control } from "ol/control";
import { translate } from "../../../../util/util";
import BasemapSelector from "../BasemapSelector/BasemapSelector";
import "./BasemapSelectorControl.scss";

export class BasemapSelectorControl extends Control {
    /**
     *
     * @param {{
     *     map: ol.Map
     * }} options
     */
    constructor(options) {
        const defaultClass = "ol-unselectable ol-control basemap-selector";

        // Load default html and behavior
        const element = document.createElement("div");
        element.className = defaultClass;

        // Control button
        const button = document.createElement("button");
        button.title = translate("control-basemap-selector-open");
        button.innerHTML = "B";
        button.type = "button";
        element.appendChild(button);

        // Container for the elements if control is active
        const contentContainer = document.createElement("div");
        contentContainer.className = "content-container";
        contentContainer.style.display = "none";
        element.appendChild(contentContainer);

        // Define the handler
        const handleToggleControl = () => {
            const isActive = contentContainer.style.display === "block";
            element.className = isActive
                ? defaultClass
                : `${defaultClass} active`;
            contentContainer.style.display = isActive ? "none" : "block";
        };

        // Attach the image manipulation tool
        ReactDOM.render(
            <BasemapSelector map={options.map} />,
            contentContainer
        );

        // Add event listeners
        button.addEventListener("click", handleToggleControl, false);
        button.addEventListener("touchstart", handleToggleControl, false);

        super({ element, target: options.target });
    }
}

export default BasemapSelectorControl;
