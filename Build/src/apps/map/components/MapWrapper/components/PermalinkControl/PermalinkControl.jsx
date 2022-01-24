/**
 * Created by nicolas.looschen@pikobytes.de on 17.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import ReactDOM from "react-dom";
import { Control } from "ol/control";

import { translate } from "../../../../../../util/util";
import PermalinkExporter from "./PermalinkExporter";
import { generateControlToggleHandler } from "../../util.js";
import { UNIQUE_CONTROL_PANEL_CLASS } from "../../../Controls/BasemapSelectorControl.jsx";
import "./PermalinkControl.scss";

export class PermalinkControl extends Control {
  /**
   *
   * @param {{
   * camera: object,
   * is3dActive,
   * refActiveBasemapId,
   * refSelectedFeatures
   * }} options
   */
  constructor(options) {
    const defaultClass = `ol-unselectable ol-control ol-permalink ${UNIQUE_CONTROL_PANEL_CLASS}`;

    // Load default html and behavior
    const element = document.createElement("div");
    element.className = defaultClass;

    // Control button
    const button = document.createElement("button");
    button.title = translate("control-permalink-open");
    button.type = "button";
    element.appendChild(button);

    // Container for the elements if control is active
    const contentContainer = document.createElement("div");
    contentContainer.className = "content-container";
    contentContainer.style.display = "none";
    element.appendChild(contentContainer);

    super({ element });
    this.renderOptions = Object.assign({}, options, {
      contentContainer,
      defaultClass,
      element,
    });

    const handleToggleControl = generateControlToggleHandler(
      this.renderOptions
    );

    // Add event listeners
    button.addEventListener("click", handleToggleControl, false);
    button.addEventListener("touchstart", handleToggleControl, false);

    this.is3dActive = options.is3dActive ?? false;

    this.mutObserver = new MutationObserver((records) => {
      // check if the active state has changed and toggle the container visibility accordingly
      records.forEach(({ target }) => {
        const isActive = target.classList.contains("active");
        contentContainer.style.display = isActive ? "block" : "none";

        // rerender if this control has become active
        if (isActive) this.render();
      });
    });

    this.mutObserver.observe(element, { attributes: true });
  }

  // rerender react element on external 3d state update
  handleExternal3dStateUpdate = (newIs3dActive) => {
    this.is3dActive = newIs3dActive;
    this.render();
  };

  render() {
    const {
      camera,
      contentContainer,
      refActiveBasemapId,
      refApplicationStateUpdater,
      refSelectedFeatures,
    } = this.renderOptions;

    const isActive = contentContainer.style.display === "block";

    // Attach the image manipulation tool
    ReactDOM.render(
      <PermalinkExporter
        camera={camera}
        isActive={isActive}
        is3dActive={this.is3dActive}
        map={this.getMap()}
        refActiveBasemapId={refActiveBasemapId}
        refApplicationStateUpdater={refApplicationStateUpdater}
        refSelectedFeatures={refSelectedFeatures}
      />,
      contentContainer
    );
  }
}

export default PermalinkControl;
