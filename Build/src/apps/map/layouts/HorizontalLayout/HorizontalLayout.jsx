/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useRef } from "react";
import { useRecoilState } from "recoil";
import PropTypes from "prop-types";

import GeoJsonLayerView from "@map/views/GeoJsonLayerView";
import { selectedOriginalMapIdState } from "@map/atoms";
import LayerManagement from "@map/components/LayerManagement/LayerManagement";
import SpatialTemporalSearch from "@map/components/SpatialTemporalSearch/SpatialTemporalSearch";
import OriginalMapView from "@map/views/OriginalMapView/OriginalMapView";
import { useSetElementScreenSize } from "@util/hooks";
import GeoJsonFeatureViewWithTransition from "@map/views/GeoJsonFeatureView";

import "./HorizontalLayout.scss";

export const HorizontalLayout = ({ onAddGeoJson }) => {
  const [selectedOriginalMapId, setOriginalMapId] = useRecoilState(
    selectedOriginalMapIdState
  );

  //refs
  const spatialSearchRef = useRef(null);

  useSetElementScreenSize(spatialSearchRef, "spatialtemporalsearch");

  const handleClose = () => setOriginalMapId(undefined);

  return (
    <React.Fragment>
      <div className="vkf-horizontal-layout">
        <div
          className="spatialsearch-container"
          id="spatialsearch-container"
          ref={spatialSearchRef}
        >
          <SpatialTemporalSearch />
        </div>
        <div className="geojson-feature-view-container">
          <GeoJsonFeatureViewWithTransition />
        </div>
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
    </React.Fragment>
  );
};

HorizontalLayout.propTypes = {
  onAddGeoJson: PropTypes.func,
};

export default HorizontalLayout;
