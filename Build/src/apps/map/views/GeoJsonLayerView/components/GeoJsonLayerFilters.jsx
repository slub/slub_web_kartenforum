/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import clsx from "clsx";
import TimeSlider from "@components/TimeSlider";
import { translate } from "@util/util";
import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  GEOJSON_LAYER_VIEW_MODE,
  geoJsonLayerViewIsValidTimeRangeState,
  geoJsonLayerViewTimeExtentFilterState,
  geoJsonLayerViewTimeRangeState,
  geoJsonLayerViewViewModeState,
} from "@map/views/GeoJsonLayerView/atoms";
import VkfIcon from "@components/VkfIcon";
import { GeoJsonLayerFilterSynchronizer } from "@map/views/GeoJsonLayerView/components/GeoJsonLayerFilterSynchronizer";

export const GeoJsonLayerFilters = () => {
  const isValidTimeRange = useRecoilValue(
    geoJsonLayerViewIsValidTimeRangeState
  );
  const timeRange = useRecoilValue(geoJsonLayerViewTimeRangeState);
  const viewMode = useRecoilValue(geoJsonLayerViewViewModeState);

  const setTimeExtentFilter = useSetRecoilState(
    geoJsonLayerViewTimeExtentFilterState
  );

  return (
    <>
      <div
        className={clsx(
          "plain-divider",
          viewMode === GEOJSON_LAYER_VIEW_MODE.FILTER &&
            isValidTimeRange &&
            "filtered"
        )}
      >
        <span
          className={clsx(
            "caret-container",
            viewMode === GEOJSON_LAYER_VIEW_MODE.FILTER &&
              isValidTimeRange &&
              "filtered"
          )}
        >
          <VkfIcon name="caret" />
        </span>
      </div>
      <div
        className={clsx(
          "filter-container",
          viewMode === GEOJSON_LAYER_VIEW_MODE.FILTER &&
            isValidTimeRange &&
            "in"
        )}
      >
        {viewMode !== GEOJSON_LAYER_VIEW_MODE.EDIT && isValidTimeRange && (
          <TimeSlider
            title={`${translate("geojsonlayerpanel-timefilter-title")}: `}
            timeRange={timeRange}
            onChange={(values) => setTimeExtentFilter(values)}
            values={timeRange}
            sliderProps={{ step: 86400, draggableTrack: true }}
            shouldUseDate
            showControls
          />
        )}
      </div>
      <GeoJsonLayerFilterSynchronizer />
    </>
  );
};
