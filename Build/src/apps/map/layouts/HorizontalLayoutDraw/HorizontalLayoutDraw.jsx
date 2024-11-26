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
import { GeoJsonFeatureEditPanelWrapper } from "@map/components/GeoJson/GeoJsonFeatureEditPanel";
import useGeoJsonFeatureEdit from "@map/hooks/useGeoJsonFeatureEdit";

import "./HorizontalLayoutDraw.scss";

export const HorizontalLayoutDraw = () => {
  const geoJsonProps = useGeoJsonFeatureEdit();

  return (
    <>
      <div className="vkf-horizontal-layout-draw">
        <div className="geojson-control-bar-container">
          <GeoJsonControlBar />
        </div>
        <ExitTransition
          className="geojson-feature-edit-panel-container"
          Component={GeoJsonFeatureEditPanelWrapper}
          props={geoJsonProps}
        />
      </div>
      <MapboxDrawLoader />
    </>
  );
};

HorizontalLayoutDraw.propTypes = {};

export default HorizontalLayoutDraw;
