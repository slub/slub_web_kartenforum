/*
 * Created by tom.schulze@pikobytes.de on 06.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import { useRecoilValue } from "recoil";

import ExitTransition from "@components/ExitTransition";

import { GeoJsonControlBarExternalVectorMap } from "@map/components/GeoJson/GeoJsonControlBar";
import { vectorMapExternalModePanelState } from "@map/atoms";
import { VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE } from "../util";
import VectorMapExternalLoader from "@map/components/GeoJson/ExternalVectorMapLoader";
import { MetadataPanelExternalVectorMap } from "@map/components/GeoJson/GeoJsonMetadataPanel";

import "./HorizontalLayoutExternalVectorMap.scss";

const HorizontalLayoutExternalVectorMap = () => {
  const externalModePanel = useRecoilValue(vectorMapExternalModePanelState);

  return (
    <>
      <div className="vkf-horizontal-layout-vector-map-external">
        <div className="geojson-control-bar-container">
          <GeoJsonControlBarExternalVectorMap />
        </div>
        <ExitTransition
          className="geojson-metadata-panel-container"
          Component={MetadataPanelExternalVectorMap}
          props={
            externalModePanel === VECTOR_MAP_EXTERNAL_MODE_PANEL_STATE.METADATA
              ? {}
              : null
          }
        />
      </div>
      <VectorMapExternalLoader />
    </>
  );
};

HorizontalLayoutExternalVectorMap.propTypes = {};

export default HorizontalLayoutExternalVectorMap;
