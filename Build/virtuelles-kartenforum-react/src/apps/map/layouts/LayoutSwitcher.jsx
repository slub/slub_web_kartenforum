/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";

import { LAYOUT_TYPES } from "./util";
import { HorizontalLayout } from "./HorizontalLayout/HorizontalLayout";
import VerticalLayout from "./VerticalLayout/VerticalLayout";
import MapWrapper from "../components/MapWrapper/MapWrapper";
import SettingsProvider from "../../../SettingsProvider";

const getLayoutComponent = (layout) => {
  switch (layout) {
    case LAYOUT_TYPES.HORIZONTAL:
      return HorizontalLayout;
    case LAYOUT_TYPES.VERTICAL:
      return VerticalLayout;
    default:
      return VerticalLayout;
  }
};

export const LayoutSwitcher = (props) => {
  const { layout } = props;

  const settings = SettingsProvider.getSettings();
  let LayoutComponent = getLayoutComponent(layout);

  return (
    <MapWrapper
      baseMapUrl={settings["OSM_URLS"]}
      enable3d
      enableTerrain
      layout={layout}
      mapViewSettings={settings["MAPVIEW_PARAMS"]}
      terrainTilesUrl={settings["TERRAIN_TILES_URL"]}
      ChildComponent={LayoutComponent}
    />
  );
};

LayoutSwitcher.propTypes = {
  layout: PropTypes.oneOf(Object.values(LAYOUT_TYPES)),
};

export default React.memo(LayoutSwitcher);
