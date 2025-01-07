/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import { translate } from "@util/util";
import VkfIcon from "@components/VkfIcon";
import React, { useCallback } from "react";
import { GeoJsonLayer } from "@map/components/CustomLayers";
import { triggerJsonDownload } from "@map/components/LayerManagement/util";
import { useRecoilCallback, useRecoilState, useRecoilValue } from "recoil";
import {
  GEOJSON_LAYER_VIEW_MODE,
  geoJsonLayerViewExistFilteredFeaturesState,
  geoJsonLayerViewFilteredFeaturesState,
  geoJsonLayerViewIsValidTimeRangeState,
  geoJsonLayerViewLayerState,
  geoJsonLayerViewViewModeState,
} from "@map/views/GeoJsonLayerView/atoms";

export const GeoJsonLayerActions = () => {
  const existFilteredFeatures = useRecoilValue(
    geoJsonLayerViewExistFilteredFeaturesState
  );
  const [viewMode, setViewMode] = useRecoilState(geoJsonLayerViewViewModeState);

  const isValidTimeRange = useRecoilValue(
    geoJsonLayerViewIsValidTimeRangeState
  );

  const handleFeatureFilterClick = useCallback(() => {
    setViewMode((oldViewMode) =>
      oldViewMode === GEOJSON_LAYER_VIEW_MODE.FILTER
        ? GEOJSON_LAYER_VIEW_MODE.INITIAL
        : GEOJSON_LAYER_VIEW_MODE.FILTER
    );
  }, []);

  const handleGeoJsonDownloadClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const filteredFeatures = await snapshot.getPromise(
          geoJsonLayerViewFilteredFeaturesState
        );
        const selectedLayer = await snapshot.getPromise(
          geoJsonLayerViewLayerState
        );

        const geoJson = {
          type: "FeatureCollection",
          features: filteredFeatures,
        };

        const convertedGeoJson = GeoJsonLayer.toPersistence(geoJson);

        const jsonString = JSON.stringify(convertedGeoJson);
        const title = selectedLayer.getMetadata("title");

        triggerJsonDownload(title, jsonString);
      },
    []
  );

  return (
    <>
      <CustomButton
        className="geojson-headline--button export-button"
        disabled={!existFilteredFeatures}
        onClick={handleGeoJsonDownloadClick}
        title={translate("layermanagement-export-geojson")}
      >
        <VkfIcon name="export-geojson" />
      </CustomButton>
      <CustomButton
        className="geojson-headline--button filter-button"
        disabled={
          viewMode === GEOJSON_LAYER_VIEW_MODE.EDIT || !isValidTimeRange
        }
        onClick={handleFeatureFilterClick}
        title={translate("layermanagement-filter-geojson-features")}
      >
        <VkfIcon name="filter" />
      </CustomButton>
    </>
  );
};

export default GeoJsonLayerActions;
