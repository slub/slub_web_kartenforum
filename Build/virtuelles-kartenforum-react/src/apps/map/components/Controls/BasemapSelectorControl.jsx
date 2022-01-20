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
import { generateControlToggleHandler } from "../MapWrapper/util.js";
import "./BasemapSelectorControl.scss";

export const UNIQUE_CONTROL_PANEL_CLASS = "vkf-unique-control-panel";

export class BasemapSelectorControl extends Control {
  /**
   *
   * @param {{
   * initialBasemapId: string,
   * onBasemapChange: function,
   * }} options
   */
  constructor(options) {
    const defaultClass = `ol-unselectable ol-control basemap-selector ${UNIQUE_CONTROL_PANEL_CLASS}`;

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

    super({ element, target: options.target });
    this.renderOptions = Object.assign({}, options, {
      contentContainer,
      defaultClass,
      element,
    });

    const handleToggleControl = generateControlToggleHandler(
      this.renderOptions,
      this.handleClickAway
    );

    this.handleToggleControl = handleToggleControl;

    // Add event listeners
    button.addEventListener("click", handleToggleControl, false);
    button.addEventListener("touchstart", handleToggleControl, false);

    const mutObserver = new MutationObserver((records) => {
      // check if the active state has changed and toggle the container visibility accordingly
      records.forEach(({ target }) => {
        const isActive = target.classList.contains("active");
        contentContainer.style.display = isActive ? "block" : "none";

        // remove the click away listener if the content container is hidden
        if (!isActive) {
          document.removeEventListener("click", this.handleClickAway);
        }
      });
    });

    mutObserver.observe(element, {
      attributes: true,
    });
  }

  // Handle closing of control on outside click
  handleClickAway = (event) => {
    const { contentContainer, element } = this.renderOptions;
    const isClickInside = contentContainer.contains(event.target);

    if (!isClickInside) {
      element.classList.remove("active");
    }
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
