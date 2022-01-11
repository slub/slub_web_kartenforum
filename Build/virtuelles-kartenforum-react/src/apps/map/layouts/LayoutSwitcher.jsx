/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";
import SettingsProvider from "../../../SettingsProvider";
import { LAYOUT_TYPES } from "./util";
import { HorizontalLayout } from "./HorizontalLayout/HorizontalLayout";
import VerticalLayout from "./VerticalLayout/VerticalLayout";
import { MapWrapperWithGeojsonSupport } from "../components/MapWrapper/MapWrapperWithGeojsonSupport";

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
  let LayoutComponent = getLayoutComponent(layout);

  return (
    <MapWrapperWithGeojsonSupport
      mapWrapperProps={{
        baseMapUrl: SettingsProvider.getDefaultBaseMapUrls(),
        enable3d: true,
        enableTerrain: true,
        layout,
        mapViewSettings: SettingsProvider.getDefaultMapView(),
        terrainTilesUrl: SettingsProvider.getTerrainUrls(),
        ChildComponent: LayoutComponent,
      }}
    />
  );
};

LayoutSwitcher.propTypes = {
  layout: PropTypes.oneOf(Object.values(LAYOUT_TYPES)),
};

export default React.memo(LayoutSwitcher);
