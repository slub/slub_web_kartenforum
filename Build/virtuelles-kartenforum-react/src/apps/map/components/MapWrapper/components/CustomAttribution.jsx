/**
 * Created by nicolas.looschen@pikobytes.de on 27/10/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * Created by nicolas.looschen@pikobytes.de on 26/10/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { Control } from "ol/control";
import ReactDOM from "react-dom";

export const TERRAIN_ATTRIBUTION_ID = "terrain-attribution";

const attribution = [
  {
    el: [
      "©",
      <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>,
    ],
  },
  {
    id: TERRAIN_ATTRIBUTION_ID,
    el: [
      <a href="https://cesiumjs.org/data-and-assets/terrain/stk-world-terrain.html">
        © Analytical Graphics, Inc., © CGIAR-CSI, Produced using Copernicus data
        and information funded by the European Union - EU-DEM layers, ©
        Commonwealth of Australia (Geoscience Australia) 2012
      </a>,
    ],
  },
];

export class CustomAttribution extends Control {
  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement("div");
    element.className =
      "ol-attribution ol-unselectable ol-control ol-uncollapsible ol-logo-only";

    ReactDOM.render(<AttributionList />, element);

    super({ element, target: options.target });
  }
}

const AttributionList = () => {
  return (
    <ul>
      {attribution.map(({ el, id }, index) => (
        <li
          key={index}
          id={id}
          ref={(el) =>
            el &&
            id === TERRAIN_ATTRIBUTION_ID &&
            el.style.setProperty("display", "none", "important")
          }
        >
          {el}
        </li>
      ))}
    </ul>
  );
};

export default CustomAttribution;
