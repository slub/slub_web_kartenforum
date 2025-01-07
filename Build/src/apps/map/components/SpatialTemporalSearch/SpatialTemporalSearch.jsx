/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import clsx from "clsx";
import MapSearch from "@map/components/MapSearch/MapSearch";
import TimeSliderSearch from "@map/components/TimeSliderSearch";
import SettingsProvider from "@settings-provider";
import PlacenameSearchMap from "@components/PlacenameSearch/PlacenameSearchMap.jsx";
import { isGeoJsonFeatureSelectedState } from "@map/atoms";

import "./SpatialTemporalSearch.scss";

export const SpatialTemporalSearch = ({
  customQuery,
  MapSearchListItemComponent,
  mosaicMode,
}) => {
  const isGeoJsonFeatureSelected = useRecoilValue(
    isGeoJsonFeatureSelectedState
  );

  return (
    <div
      className={clsx(
        "vkf-spatialsearch-root",
        !isGeoJsonFeatureSelected && "in"
      )}
    >
      <div className="spatialsearch-inner-container">
        <div className="spatialsearch-content-panel">
          <div className="body-container">
            <PlacenameSearchMap
              searchUrl={SettingsProvider.getNominatimUrl()}
            />
            <TimeSliderSearch />
            <MapSearch
              customQuery={customQuery}
              MapSearchListItemComponent={MapSearchListItemComponent}
              mosaicMode={mosaicMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

SpatialTemporalSearch.propTypes = {
  customQuery: PropTypes.array,
  MapSearchListItemComponent: PropTypes.elementType,
  mosaicMode: PropTypes.bool,
};

export default SpatialTemporalSearch;
