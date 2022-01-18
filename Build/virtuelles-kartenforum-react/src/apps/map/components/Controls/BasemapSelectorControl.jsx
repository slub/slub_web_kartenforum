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
   * initialBasemapId: string,
   * onBasemapChange: function,
   * }} options
   */
  constructor(options) {
    const defaultClass = "ol-unselectable ol-control basemap-selector";

    // Load default html and behavior
    const element = document.createElement("div");
    element.className = defaultClass;

    // Control button
    const button = document.createElement("button");
    button.title = translate("control-basemapselector-open");
    button.innerHTML = "B";
    button.type = "button";
    element.appendChild(button);

    // Container for the elements if control is active
    const contentContainer = document.createElement("div");
    contentContainer.className = "content-container";
    contentContainer.style.display = "none";
    element.appendChild(contentContainer);

    super({ element, target: options.target });

    // Add event listeners
    button.addEventListener("click", this.handleToggleControl, false);
    button.addEventListener("touchstart", this.handleToggleControl, false);

    this.renderOptions = Object.assign({}, options, {
      contentContainer,
      defaultClass,
      element,
    });
  }

  // Handle closing of control on outside click
  handleClickAway = (event) => {
    const { contentContainer } = this.renderOptions;
    const isClickInside = contentContainer.contains(event.target);

    if (!isClickInside) {
      this.handleToggleControl();
    }
  };

  // Define the handler
  handleToggleControl = (e) => {
    const { contentContainer, defaultClass, element } = this.renderOptions;
    const isActive = contentContainer.style.display === "block";

    if (e !== undefined) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isActive) {
      document.addEventListener("click", this.handleClickAway);
    } else {
      document.removeEventListener("click", this.handleClickAway);
    }

    element.className = isActive ? defaultClass : `${defaultClass} active`;
    contentContainer.style.display = isActive ? "none" : "block";
  };

  render() {
    const {
      contentContainer,
      initialBasemapId,
      onBasemapChange,
      onSetNotification,
    } = this.renderOptions;

    // Attach the image manipulation tool
    ReactDOM.render(
      <BasemapSelector
        map={this.getMap()}
        initialBasemapId={initialBasemapId}
        onBasemapChange={onBasemapChange}
        onSetNotification={onSetNotification}
      />,
      contentContainer
    );
  }
}

export default BasemapSelectorControl;
