/*
 * Created by tom.schulze@pikobytes.de on 22.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";

import MapboxDrawLoader from "@map/components/GeoJson/MapboxDrawLoader";
import GeoJsonControlBar from "@map/components/GeoJson/GeoJsonControlBar";
import ExitTransition from "@components/ExitTransition";
import GeoJsonMetadataPanel from "@map/components/GeoJson/GeoJsonMetadataPanel";
import { GeoJsonFeatureEditPanelWrapper } from "@map/components/GeoJson/GeoJsonFeatureEditPanel";
import useGeoJsonFeatureDraw from "@map/hooks/useGeoJsonFeatureDraw";

import "./HorizontalLayoutDraw.scss";
import { useRecoilValue } from "recoil";
import { drawModePanelState } from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "../util";

export const HorizontalLayoutDraw = () => {
  const geoJsonProps = useGeoJsonFeatureDraw();
  const drawModePanel = useRecoilValue(drawModePanelState);

  return (
    <>
      <div className="vkf-horizontal-layout-draw">
        <div className="geojson-control-bar-container">
          <GeoJsonControlBar />
        </div>
        <ExitTransition
          className="geojson-metadata-panel-container"
          Component={GeoJsonMetadataPanel}
          props={{}}
          enter={drawModePanel === DRAW_MODE_PANEL_STATE.METADATA}
        />
        <ExitTransition
          className="geojson-feature-edit-panel-container"
          Component={GeoJsonFeatureEditPanelWrapper}
          props={geoJsonProps}
          enter={drawModePanel === DRAW_MODE_PANEL_STATE.FEATURE}
        />
      </div>
      <MapboxDrawLoader />
    </>
  );
};

HorizontalLayoutDraw.propTypes = {};

export default HorizontalLayoutDraw;
