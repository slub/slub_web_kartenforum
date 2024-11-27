/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import SettingsProvider from "@settings-provider";
import { HORIZONTAL_LAYOUT_MODE, LAYOUT_TYPES } from "./util";
import { HorizontalLayout } from "./HorizontalLayout/HorizontalLayout";
import { HorizontalLayoutDraw } from "./HorizontalLayoutDraw/HorizontalLayoutDraw";
import VerticalLayout from "./VerticalLayout/VerticalLayout";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { horizontalLayoutModeState, layoutState } from "@map/atoms";
import MapWrapper from "@map/components/MapWrapper/MapWrapper";

const getHorizontalLayoutComponent = (layoutMode) => {
  switch (layoutMode) {
    case HORIZONTAL_LAYOUT_MODE.STANDARD:
      return HorizontalLayout;
    case HORIZONTAL_LAYOUT_MODE.DRAW:
      return HorizontalLayoutDraw;
    default:
      HorizontalLayout;
  }
};

const getLayoutComponent = (layout, layoutMode) => {
  switch (layout) {
    case LAYOUT_TYPES.HORIZONTAL:
      return getHorizontalLayoutComponent(layoutMode);
    case LAYOUT_TYPES.VERTICAL:
      return VerticalLayout;
    default:
      return VerticalLayout;
  }
};

export const LayoutSwitcher = (props) => {
  const { layout } = props;
  const setLayout = useSetRecoilState(layoutState);
  const horizontalLayoutMode = useRecoilValue(horizontalLayoutModeState);

  let LayoutComponent = getLayoutComponent(layout, horizontalLayoutMode);

  // publish layout to global state
  useEffect(() => {
    setLayout(layout);
  }, [layout]);

  return (
    <MapWrapper
      baseMapUrl={SettingsProvider.getDefaultBaseMapUrls()}
      enable3d={true}
      enableTerrain={true}
      layout={layout}
      mapViewSettings={SettingsProvider.getDefaultMapView()}
      ChildComponent={LayoutComponent}
    />
  );
};

LayoutSwitcher.propTypes = {
  layout: PropTypes.oneOf(Object.values(LAYOUT_TYPES)),
};

export default React.memo(LayoutSwitcher);
