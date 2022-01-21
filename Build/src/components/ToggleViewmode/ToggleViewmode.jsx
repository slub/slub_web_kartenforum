/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Control } from "ol/control";

import { translate } from "../../util/util";
import SettingsProvider from "../../SettingsProvider";

export const MIN_3D_ZOOM = 9;

export class ToggleViewMode extends Control {
  constructor(opt_options) {
    const options = opt_options || {};
    const defaultClass = "flip-view-mode ol-unselectable ol-control";
    const initialState = options.initialState;
    const element = document.createElement("div");
    element.className = !initialState ? defaultClass : `${defaultClass} active`;

    const button = document.createElement("button");
    button.title = translate("control-toggleviewmode-title");
    button.type = "button";
    element.appendChild(button);

    const infoMessage = document.createElement("div");
    infoMessage.className = "info-message";
    infoMessage.innerHTML = translate("control-toggleviewmode-zoomin");
    element.appendChild(infoMessage);

    // Handle click or touchevent
    let timeout;
    const handleUpdate = () => {
      options.onViewModeChange((currentIs3dActive) => {
        // If newState == true, we signal that we should activate the 3d view
        const newIs3dActive =
          !currentIs3dActive &&
          this.getMap().getView().getZoom() >
            SettingsProvider.getMin3DZoomLevel();

        // Toggle active class
        element.className = !newIs3dActive
          ? defaultClass
          : `${defaultClass} active`;

        if (!newIs3dActive && !currentIs3dActive) {
          // In this case we expect that the 3d view can not be activated because of not meeting the
          // zoom level condition
          infoMessage.classList.add("open");
          timeout = setTimeout(() => {
            infoMessage.classList.remove("open");
          }, 4000);

          return false;
        } else {
          // if the 3d mode was activated successfully close the message
          clearTimeout(timeout);
          infoMessage.classList.remove("open");
        }

        return newIs3dActive;
      });
    };

    button.addEventListener("click", handleUpdate, false);
    button.addEventListener("touchstart", handleUpdate, false);

    // Necessary for proper inheritance from control
    super({ element, target: options.target });

    this.handleExternal3dStateUpdate = (newIs3dActive) => {
      if (newIs3dActive && !element.classList.contains("active")) {
        element.classList.add("active");
      } else if (!newIs3dActive && element.classList.contains("active")) {
        element.classList.remove("active");
      }
    };
  }
}

export default ToggleViewMode;
