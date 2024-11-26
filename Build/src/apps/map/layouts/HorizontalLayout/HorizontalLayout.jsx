/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { useRecoilState } from "recoil";
import PropTypes from "prop-types";

import GeoJsonLayerView from "@map/views/GeoJsonLayerView";
import { selectedOriginalMapIdState } from "@map/atoms";
import LayerManagement from "@map/components/LayerManagement/LayerManagement";
import SpatialTemporalSearch from "@map/components/SpatialTemporalSearch/SpatialTemporalSearch";
import OriginalMapView from "@map/views/OriginalMapView/OriginalMapView";
import { GeoJsonFeaturePanelWrapper } from "@map/components/GeoJson/GeoJsonFeaturePanel";
import ExitTransition from "@components/ExitTransition";
import useGeoJsonFeature from "@map/hooks/useGeoJsonFeature";

import "./HorizontalLayout.scss";

export const HorizontalLayout = ({ onAddGeoJson }) => {
  const [selectedOriginalMapId, setOriginalMapId] = useRecoilState(
    selectedOriginalMapIdState
  );

  const geoJsonProps = useGeoJsonFeature();

  const handleClose = () => setOriginalMapId(undefined);

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
          <LayerManagement onAddGeoJson={onAddGeoJson} />
        </div>
        <div className="geojson-layer-view-container">
          <GeoJsonLayerView />
        </div>
      </div>
      <OriginalMapView
        onClose={handleClose}
        isOpen={selectedOriginalMapId !== undefined}
        map_id={selectedOriginalMapId}
      />
    </>
  );
};

HorizontalLayout.propTypes = {
  onAddGeoJson: PropTypes.func,
};

export default HorizontalLayout;
