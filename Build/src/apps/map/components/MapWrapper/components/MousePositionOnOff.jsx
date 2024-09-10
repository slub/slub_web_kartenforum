/**
 * Created by nicolas.looschen@pikobytes.de on 26/10/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import round from "lodash.round";
import { translate } from "../../../../../util/util";
import { getControlFeedbackContainer } from "../util.js";
import "./MousePositionOnOff.scss";

const COORDINATE_DECIMALS = 3;

const formatCoordinate = (coordinate) => {
  return `${round(coordinate[0], 7)},${round(coordinate[1], 7)}`;
};

export class MousePositionOnOff {
  buttonCopyPosition = undefined;
  textElCurrentPosition = undefined;
  textElSavedPosition = undefined;

  targetEl = undefined;
  _container = undefined;
  savedPosition = undefined;

  onAdd(map) {
    this._map = map;
    const element = document.createElement("div");
    element.className = "mouse-position maplibregl-ctrl maplibregl-ctrl-group";

    const button = document.createElement("button");
    button.title = translate("control-mouseposition-title");
    button.type = "button";

    element.appendChild(button);
    this._container = element;
    button.addEventListener("click", this.toggleMousePosition, false);

    return this._container;
  }

  onRemove() {
    this._map.off("mousemove", this.updatePosition);
    this._map.off("click", this.savePosition);

    this._map = null;
    this._container.parentNode.removeChild(this._container);
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
    if (this._map) {
      const coordinate = event.lngLat.toArray();

      // write position to state
      this.savedPosition = coordinate.slice();

      // write to clipboard
      navigator.clipboard.writeText(formatCoordinate(coordinate));

      // update displayed text
      this.updatePosition(event);
    }
  };

  updatePosition = (event) => {
    const textElCurrentPosition = this.textElCurrentPosition;
    const textElSavedPosition = this.textElSavedPosition;
    const { lngLat } = event;

    textElCurrentPosition.innerHTML =
      "Lon: " +
      round(lngLat.lng, COORDINATE_DECIMALS) +
      ", Lat: " +
      round(lngLat.lat, COORDINATE_DECIMALS);

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
    const isActive = this._container.classList.contains(activeClass);
    const map = this._map;
    if (!map) {
      return;
    }
    // toggle activation on anchor
    this._container.classList.toggle(activeClass);

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
      map.on("mousemove", this.updatePosition);
      map.on("click", this.savePosition);
    } else {
      map.off("mousemove", this.updatePosition);
      map.off("click", this.savePosition);
    }

    this.updatePosition({
      lngLat: map.unproject([event.clientX, event.clientY]),
    });

    targetEl.classList.toggle(activeClass);
    viewport.classList.toggle(`mouseposition-${activeClass}`);
  };
}
