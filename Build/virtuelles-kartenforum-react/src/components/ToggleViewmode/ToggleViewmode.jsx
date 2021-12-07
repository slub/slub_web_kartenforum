/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Control } from "ol/control";
import { translate } from "../../util/util";
import "./ToggleViewMode.scss";

export class ToggleViewMode extends Control {
  constructor(opt_options) {
    const options = opt_options || {};
    const defaultClass = "flip-view-mode ol-unselectable ol-control";
    const initialState = options.initialState;
    console.log(initialState);
    const element = document.createElement("div");
    element.className = !initialState ? defaultClass : `${defaultClass} active`;

    const button = document.createElement("button");
    button.title = translate("flipviewmode-title");
    button.type = "button";
    element.appendChild(button);

    const buttonText = document.createElement("span");
    buttonText.className = "flipviewmode-button-label";
    buttonText.innerHTML = "3D";
    button.appendChild(buttonText);

    const infoMessage = document.createElement("div");
    infoMessage.className = "info-message";
    infoMessage.innerHTML = translate("flipviewmode-zoomin");
    element.appendChild(infoMessage);

    // Handle click or touchevent
    let timeout;
    const handleUpdate = () => {
      const min3DZoom = 8;

      options.propagateViewMode((currentIs3dActive) => {
        // If newState == true, we signal that we should activate the 3d view
        const newIs3dActive =
          !currentIs3dActive && this.getMap().getView().getZoom() > min3DZoom;

        // Toggle active class
        element.className = !newIs3dActive
          ? defaultClass
          : `${defaultClass} active`;

        if (!newIs3dActive && this.getMap().getView().getZoom() <= min3DZoom) {
          // In this case we expect that the 3d view can not be activated because of not meeting the
          // zoom level condition
          infoMessage.classList.add("open");
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            infoMessage.classList.remove("open");
          }, 4000);

          return false;
        }

        return newIs3dActive;
      });
    };
    button.addEventListener("click", handleUpdate, false);
    button.addEventListener("touchstart", handleUpdate, false);

    // Necessary for proper inheritence from control
    super({ element, target: options.target });
  }
}

export default ToggleViewMode;
