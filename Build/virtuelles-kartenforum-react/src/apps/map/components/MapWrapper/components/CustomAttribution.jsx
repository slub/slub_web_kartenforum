/**
 * Created by nicolas.looschen@pikobytes.de on 27/10/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { Control } from "ol/control";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

export const TERRAIN_ATTRIBUTION_ID = "terrain-attribution";

const attribution = [
  {
    el: [
      "©",
      <a key="osm" href="http://www.openstreetmap.org/copyright">
        OpenStreetMap
      </a>,
    ],
  },
  {
    id: TERRAIN_ATTRIBUTION_ID,
    el: [
      <a
        key="copernicus"
        href="https://cesiumjs.org/data-and-assets/terrain/stk-world-terrain.html"
      >
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

    super({ element, target: options.target });
    this.element = element;
    this.is3d = options.is3d;
  }

  render() {
    ReactDOM.render(<AttributionList is3d={this.is3d} />, this.element);
  }

  handleExternal3dStateUpdate = (newIs3d) => {
    this.is3d = newIs3d;
    this.render();
  };
}

const AttributionList = ({ is3d }) => {
  return (
    <ul>
      {attribution.map(({ el, id }, index) => (
        <li
          key={`${index}_${is3d}`}
          id={id}
          style={{
            display:
              id === TERRAIN_ATTRIBUTION_ID && !is3d ? "none" : "default",
          }}
        >
          {el}
        </li>
      ))}
    </ul>
  );
};

AttributionList.propTypes = {
  is3d: PropTypes.bool,
};

export default CustomAttribution;
