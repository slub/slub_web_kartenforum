/*
 * Created by tom.schulze@pikobytes.de on 22.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useMemo } from "react";
import { useRecoilValue } from "recoil";

import MapboxDrawLoader from "@map/components/GeoJson/MapboxDrawLoader";
import GeoJsonControlBar from "@map/components/GeoJson/GeoJsonControlBar";
import ExitTransition from "@components/ExitTransition";
import GeoJsonMetadataPanel from "@map/components/GeoJson/GeoJsonMetadataPanel";
import { GeoJsonFeatureEditPanelWrapper } from "@map/components/GeoJson/GeoJsonFeatureEditPanel";
import GeoJsonFeatureDrawLoader, {
  useGeoJsonFeatureDraw,
} from "@map/components/GeoJson/GeoJsonFeatureDrawLoader";

import { drawModePanelState } from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "../util";
import GeoJsonHistoryPanel from "@map/components/GeoJson/GeoJsonHistoryPanel/GeoJsonHistoryPanel";
import { isDefined } from "@util/util";

import "./HorizontalLayoutDraw.scss";

export const HorizontalLayoutDraw = () => {
  const drawModePanel = useRecoilValue(drawModePanelState);

  const geoJsonProps = useGeoJsonFeatureDraw();

  const validatedGeoJsonProps = useMemo(() => {
    if (!isDefined(geoJsonProps.geoJsonFeature)) {
      return null;
    }

    return geoJsonProps;
  }, [geoJsonProps.geoJsonFeature]);

  return (
    <>
      <div className="vkf-horizontal-layout-draw">
        <div className="geojson-control-bar-container">
          <GeoJsonControlBar />
        </div>
        <ExitTransition
          className="geojson-metadata-panel-container"
          Component={
            drawModePanel === DRAW_MODE_PANEL_STATE.HISTORY
              ? GeoJsonHistoryPanel
              : GeoJsonMetadataPanel
          }
          props={
            drawModePanel === DRAW_MODE_PANEL_STATE.METADATA ||
            drawModePanel === DRAW_MODE_PANEL_STATE.HISTORY
              ? {}
              : null
          }
        />
        <ExitTransition
          className="geojson-feature-edit-panel-container"
          Component={GeoJsonFeatureEditPanelWrapper}
          props={
            drawModePanel === DRAW_MODE_PANEL_STATE.FEATURE
              ? validatedGeoJsonProps
              : null
          }
        />
      </div>
      <MapboxDrawLoader />
      <GeoJsonFeatureDrawLoader />
    </>
  );
};

HorizontalLayoutDraw.propTypes = {};

export default HorizontalLayoutDraw;
