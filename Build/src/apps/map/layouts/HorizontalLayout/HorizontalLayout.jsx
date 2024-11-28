/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";

import GeoJsonLayerView from "@map/views/GeoJsonLayerView";
import LayerManagement from "@map/components/LayerManagement/LayerManagement";
import SpatialTemporalSearch from "@map/components/SpatialTemporalSearch/SpatialTemporalSearch";
import OriginalMapView from "@map/views/OriginalMapView/OriginalMapView";
import { GeoJsonFeaturePanelWrapper } from "@map/components/GeoJson/GeoJsonFeaturePanel";
import ExitTransition from "@components/ExitTransition";
import useGeoJsonFeature from "@map/hooks/useGeoJsonFeature";

import DialogAddGeoJson from "@map/components/GeoJson/DialogAddGeoJson/DialogAddGeoJson";

import "./HorizontalLayout.scss";
import Dropzone from "@map/components/Dropzone/Dropzone";

export const HorizontalLayout = () => {
  const geoJsonProps = useGeoJsonFeature();

  return (
    <>
      <div className="vkf-horizontal-layout">
        <div className="spatialsearch-container" id="spatialsearch-container">
          <SpatialTemporalSearch />
        </div>
        <ExitTransition
          className="geojson-feature-panel-container"
          Component={GeoJsonFeaturePanelWrapper}
          props={geoJsonProps}
          enter={geoJsonProps !== null}
        />
        <div
          className="layermanagement-container"
          id="layermanagement-container"
        >
          <LayerManagement />
        </div>
        <div className="geojson-layer-view-container">
          <GeoJsonLayerView />
        </div>
      </div>
      <OriginalMapView />
      <DialogAddGeoJson />
      <Dropzone />
    </>
  );
};

export default HorizontalLayout;
