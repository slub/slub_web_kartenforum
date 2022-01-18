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
    const defaultClass = "ol-unselectable ol-control ol-permalink";

    // Load default html and behavior
    const element = document.createElement("div");
    element.className = defaultClass;

    // Control button
    const button = document.createElement("button");
    button.title = translate("control-permalink-open");
    button.innerHTML = "P";
    button.type = "button";
    element.appendChild(button);

    // Container for the elements if control is active
    const contentContainer = document.createElement("div");
    contentContainer.className = "content-container";
    contentContainer.style.display = "none";
    element.appendChild(contentContainer);

    super({ element });

    // Add event listeners
    button.addEventListener("click", this.handleToggleControl, false);
    button.addEventListener("touchstart", this.handleToggleControl, false);

    this.is3dActive = options.is3dActive ?? false;

    this.renderOptions = Object.assign({}, options, {
      contentContainer,
      defaultClass,
      element,
    });
  }

  // Define the handler
  handleToggleControl = (e) => {
    const { contentContainer, defaultClass, element } = this.renderOptions;
    const isActive = contentContainer.style.display === "block";

    if (e !== undefined) {
      e.preventDefault();
      e.stopPropagation();
    }

    element.className = isActive ? defaultClass : `${defaultClass} active`;
    contentContainer.style.display = isActive ? "none" : "block";
    this.render();
  };

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
        refSelectedFeatures={refSelectedFeatures}
      />,
      contentContainer
    );
  }
}

export default PermalinkControl;
