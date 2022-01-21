/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import { translate } from "../../../../../util/util";
import { Control } from "ol/control";
import { View } from "ol";

export class RestoreDefaultView extends Control {
  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement("div");
    element.className = "ol-zoom-extent ol-unselectable ol-control";

    const button = document.createElement("button");
    button.classname = "zoom-extent";
    button.title = translate("control-restoredefaultview-title");
    button.type = "button";

    element.appendChild(button);

    super({ element, target: options.target });

    this.defaultView = options.defaultView;
    button.addEventListener("click", this.restoreDefaultView, false);
  }

  restoreDefaultView = () => {
    const map = this.getMap();

    map.setView(new View(this.defaultView));
  };
}

export default RestoreDefaultView;
