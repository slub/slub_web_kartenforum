/**
 * Created by nicolas.looschen@pikobytes.de on 26/10/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import round from "lodash.round";
import { Control } from "ol/control";
import { transform } from "ol/proj";
import { translate } from "../../../../../util/util";
import SettingsProvider from "../../../../../SettingsProvider";
import { getControlFeedbackContainer } from "../util.js";
import "./MousePositionOnOff.scss";

export class MousePositionOnOff extends Control {
  targetEl = undefined;
  containerEl = undefined;

  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement("div");
    element.className = "mouse-position ol-unselectable ol-control";

    const button = document.createElement("button");
    button.title = translate("control-mouseposition-title");
    button.type = "button";

    element.appendChild(button);

    super({ element, target: options.target });

    this.containerEl = element;
    button.addEventListener("click", this.toggleMousePosition, false);
  }

  updatePosition = (event) => {
    const targetEl = this.targetEl;
    const map = this.getMap();
    const coordinate = transform(
      map.getEventCoordinate(event),
      SettingsProvider.getDefaultMapView().projection,
      "EPSG:4326"
    );
    const roundPos = 3;

    targetEl.innerHTML =
      "Lon: " +
      round(coordinate[0], roundPos) +
      ", Lat: " +
      round(coordinate[1], roundPos);
  };

  toggleMousePosition = (event) => {
    event.preventDefault();

    const activeClass = "active";
    const isActive = this.containerEl.classList.contains(activeClass);
    const map = this.getMap();

    // toggle activation on anchor
    this.containerEl.classList.toggle(activeClass);

    // initialize container for mouseposition display
    let targetEl = this.targetEl;
    const viewport = getControlFeedbackContainer(map);
    if (this.targetEl === undefined) {
      targetEl = document.createElement("div");
      targetEl.className = "ol-control ol-mouse-position-box";
      targetEl.innerHTML = "";

      viewport.appendChild(targetEl);
      this.targetEl = targetEl;
    } else {
      targetEl.innerHTML = "";
    }

    // register / unregister mouse event listener
    if (!isActive) {
      map.getViewport().addEventListener("mousemove", this.updatePosition);
    } else {
      map.getViewport().removeEventListener("mousemove", this.updatePosition);
    }

    // activate behavior
    this.updatePosition(event);
    targetEl.classList.toggle(activeClass);
    viewport.classList.toggle(`mouseposition-${activeClass}`);
  };
}
