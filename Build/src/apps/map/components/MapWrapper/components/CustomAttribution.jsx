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
import { Glyphicon } from "react-bootstrap";

import SettingsProvider from "../../../../../SettingsProvider.js";
import { isDefined } from "../../../../../util/util.js";

export const TERRAIN_ATTRIBUTION_ID = "terrain-attribution";

const RawHtml = ({ content, className }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
);

RawHtml.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
};

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
    ReactDOM.render(
      <AttributionList
        basemapAttribution={this.attribution}
        is3d={this.is3d}
        element={this.element}
      />,
      this.element
    );
  }

  handleExternal3dStateUpdate = (newIs3d) => {
    this.is3d = newIs3d;
    this.render();
  };

  handleExternalBasemapUpdate = (basemapId) => {
    const basemaps = SettingsProvider.getBaseMaps();
    const basemap = basemaps.find((bm) => bm.id === basemapId);
    this.attribution = basemap?.attribution ?? "";
    this.render();
  };
}

const AttributionList = ({ basemapAttribution, element, is3d }) => {
  const isBasemapAttributionDefined =
    isDefined(basemapAttribution) && basemapAttribution !== "";

  // add basemap attribution
  let attributionString = "";
  if (isBasemapAttributionDefined) {
    attributionString += ` ${basemapAttribution}`;
  }

  // add terrain attribution
  if (is3d) {
    attributionString += ` ${SettingsProvider.getTerrainAttribution()}`;
  }

  if (attributionString.length === 0) {
    element.classList.add("hide");
  } else {
    element.classList.remove("hide");
  }

  return (
    <>
      <input id="popover-toggle" type="checkbox" />
      <label htmlFor="popover-toggle" aria-label="attribution toggle">
        <Glyphicon glyph="info-sign" />
        Show Attribution
      </label>
      {attributionString.length > 0 && (
        <RawHtml
          className="attribution-list-container"
          content={attributionString}
        />
      )}
    </>
  );
};

AttributionList.propTypes = {
  basemapAttribution: PropTypes.string,
  element: PropTypes.object,
  is3d: PropTypes.bool,
};

export default CustomAttribution;
