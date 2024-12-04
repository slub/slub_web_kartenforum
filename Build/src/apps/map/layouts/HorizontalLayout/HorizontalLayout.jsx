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
import { useRecoilValue } from "recoil";
import { selectedGeoJsonLayerState } from "@map/atoms";

export const HorizontalLayout = () => {
  const geoJsonProps = useGeoJsonFeature();
  const { selectedLayer } = useRecoilValue(selectedGeoJsonLayerState);

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
        />
        <div
          className="layermanagement-container"
          id="layermanagement-container"
        >
          <LayerManagement />
        </div>
        <ExitTransition
          className="vkf-geojson-layer-view-root"
          Component={GeoJsonLayerView}
          props={selectedLayer ? { selectedLayer } : null}
        />
      </div>
      <OriginalMapView />
      <DialogAddGeoJson />
      <Dropzone />
    </>
  );
};

export default HorizontalLayout;
