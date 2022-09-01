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

const COORDINATE_DECIMALS = 3;

const formatCoordinate = (coordinate) => {
  return `${round(coordinate[0], 7)},${round(coordinate[1], 7)}`;
};

export class MousePositionOnOff extends Control {
  buttonCopyPosition = undefined;
  textElCurrentPosition = undefined;
  textElSavedPosition = undefined;

  targetEl = undefined;
  containerEl = undefined;
  savedPosition = undefined;

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

  generateSavedText = () => {
    if (this.savedPosition === undefined) {
      if (this.buttonCopyPosition !== undefined) {
        this.buttonCopyPosition.style.display = "none";
      }
      return translate("control-mouseposition-save-helper");
    } else {
      const savedLabel = translate("control-mouseposition-saved-label");

      if (this.buttonCopyPosition !== undefined) {
        this.buttonCopyPosition.style.display = "block";
      }

      return (
        savedLabel +
        ": " +
        "Lon: " +
        round(this.savedPosition[0], COORDINATE_DECIMALS) +
        " " +
        "Lat: " +
        round(this.savedPosition[1], COORDINATE_DECIMALS)
      );
    }
  };

  savePosition = (event) => {
    const map = this.getMap();
    const coordinate = transform(
      map.getCoordinateFromPixel(event.pixel),
      SettingsProvider.getDefaultMapView().projection,
      "EPSG:4326"
    );

    // write position to state
    this.savedPosition = coordinate.slice();

    // write to clipboard
    navigator.clipboard.writeText(formatCoordinate(coordinate));

    // update displayed text
    this.updatePosition(event.originalEvent);
  };

  updatePosition = (event) => {
    const textElCurrentPosition = this.textElCurrentPosition;
    const textElSavedPosition = this.textElSavedPosition;
    const map = this.getMap();
    const coordinate = transform(
      map.getEventCoordinate(event),
      SettingsProvider.getDefaultMapView().projection,
      "EPSG:4326"
    );

    textElCurrentPosition.innerHTML =
      "Lon: " +
      round(coordinate[0], COORDINATE_DECIMALS) +
      ", Lat: " +
      round(coordinate[1], COORDINATE_DECIMALS);

    textElSavedPosition.innerHTML = this.generateSavedText();
  };

  handleCopyButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const coordinate = this.savedPosition;
    // write to clipboard
    if (coordinate !== undefined) {
      navigator.clipboard.writeText(formatCoordinate(coordinate));
    }

    // unfocus button
    e.target.blur();
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

      // add element to show current position of cursor
      const textElCurrentPosition = document.createElement("p");
      this.textElCurrentPosition = textElCurrentPosition;

      // add elements to show saved position of cursor
      const textElSavedPosition = document.createElement("p");
      this.textElSavedPosition = textElSavedPosition;

      // add button to copy saved position to clipboard
      const button = document.createElement("button");
      button.id = "position-copy-to-clipboard";
      button.innerHTML = '<span class="glyphicon glyphicon-copy"></span>';
      button.title = translate("control-mouseposition-button-title");
      this.buttonCopyPosition = button;
      button.addEventListener("click", this.handleCopyButtonClick);

      const savedPositionContainer = document.createElement("div");
      savedPositionContainer.className = "saved-position-container";
      savedPositionContainer.appendChild(textElSavedPosition);
      savedPositionContainer.appendChild(button);

      // append elements to target Element
      targetEl.appendChild(textElCurrentPosition);
      targetEl.appendChild(savedPositionContainer);

      // add everything to viewport
      viewport.appendChild(targetEl);
      this.targetEl = targetEl;
    } else {
      this.textElCurrentPosition.innerHTML = "";
      this.textElSavedPosition.innerHTML = "";
    }

    // register / unregister mouse event listener
    if (!isActive) {
      this.savedPosition = undefined;
      map.getViewport().addEventListener("mousemove", this.updatePosition);
      map.on("click", this.savePosition);
    } else {
      map.getViewport().removeEventListener("mousemove", this.updatePosition);
      map.un("click", this.savePosition);
    }

    // activate behavior
    this.updatePosition(event);
    targetEl.classList.toggle(activeClass);
    viewport.classList.toggle(`mouseposition-${activeClass}`);
  };
}
