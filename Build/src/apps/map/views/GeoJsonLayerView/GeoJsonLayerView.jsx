/*
 * Created by tom.schulze@pikobytes.de on 16.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import {
  selectedGeoJsonLayerIdState,
  selectedGeoJsonLayerState,
  selectedGeoJsonFeatureIdentifierState,
  horizontalLayoutModeState,
  mapState,
} from "@map/atoms";
import { useRecoilValue, useSetRecoilState } from "recoil";
import clsx from "clsx";
import { isDefined, translate } from "@util/util";
import {
  formatDateLocalized,
  isValidDate,
  getUnixSeconds,
  normalizeDate,
} from "@util/date";
import GeoJsonLayerFeatureList from "@map/components/GeoJson/GeoJsonLayerFeatureList";
import GeoJsonLayerEditPanel from "@map/components/GeoJson/GeoJsonLayerEditPanel";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";
import { METADATA, GeoJsonLayer } from "@map/components/CustomLayers";
import TimeSlider from "@components/TimeSlider";
import { FEATURE_PROPERTIES } from "@map/components/GeoJson/constants";
import VkfIcon from "@components/VkfIcon";
import CustomButton from "@map/components/GeoJson/components/CustomButton";

import { triggerJsonDownload } from "@map/components/LayerManagement/util";

import "./GeoJsonLayerView.scss";
import { HORIZONTAL_LAYOUT_MODE } from "@map/layouts/util";

const VIEW_MODE = {
  INITIAL: 1,
  FILTER: 2,
  EDIT: 3,
};

// TODO DRAWING wrap in ExitTransition component
// TODO DRAWING refactor selectedGeoJsonLayerState (not needed anymore)

const GeoJsonLayerView = () => {
  const [viewMode, setViewMode] = useState(VIEW_MODE.INITIAL);
  const [timeExtentFilter, setTimeExtentFilter] = useState([]);
  const previousTimeExtentFilter = useRef([]);
  const previousSelectedLayer = useRef();

  const setSelectedGeoJsonLayerId = useSetRecoilState(
    selectedGeoJsonLayerIdState
  );
  const { selectedLayer, lastUpdated } = useRecoilValue(
    selectedGeoJsonLayerState
  );
  const setSelectedGeoJsonFeatureIdentifier = useSetRecoilState(
    selectedGeoJsonFeatureIdentifierState
  );

  const setHorizontalLayoutMode = useSetRecoilState(horizontalLayoutModeState);

  const map = useRecoilValue(mapState);

  const { title, timePublished, layerId } = useMemo(() => {
    return {
      title: selectedLayer?.getMetadata(METADATA.title),
      timePublished: selectedLayer?.getMetadata(METADATA.timePublished),
      layerId: selectedLayer?.getMetadata(METADATA.id),
    };
  }, [
    selectedLayer?.getMetadata(METADATA.title),
    selectedLayer?.getMetadata(METADATA.timePublished),
  ]);

  const formattedTimePublished = useMemo(
    () => formatDateLocalized(timePublished),
    [timePublished]
  );

  const geoJsonFeatures = useMemo(
    () => selectedLayer?.getGeoJson()?.features ?? [],
    [selectedLayer, lastUpdated]
  );

  const timeRange = useMemo(() => {
    const timestamps = geoJsonFeatures
      .map(({ properties }) => new Date(properties[FEATURE_PROPERTIES.time]))
      .filter((date) => isValidDate(date))
      .sort((a, b) => a.valueOf() - b.valueOf());

    if (timestamps.length < 2) {
      return [];
    }

    const minDate = getUnixSeconds(normalizeDate(timestamps[0]));
    const maxDate = getUnixSeconds(
      normalizeDate(timestamps[timestamps.length - 1])
    );

    if (minDate === maxDate) {
      return [];
    }

    setTimeExtentFilter([minDate, maxDate]);

    return [minDate, maxDate];
  }, [geoJsonFeatures]);

  const isValidTimeRange = useMemo(() => timeRange.length === 2, [timeRange]);

  const filteredFeatures = useMemo(() => {
    const isValidFilterExtent = timeExtentFilter.length === 2;

    if (!isValidFilterExtent) {
      return geoJsonFeatures;
    }

    const [min, max] = timeExtentFilter;

    return geoJsonFeatures.filter(({ properties }) => {
      const timestamp = properties[FEATURE_PROPERTIES.time];
      const unixTimestamp = getUnixSeconds(normalizeDate(new Date(timestamp)));

      // don't filter out features with no or invalid dates
      if (Number.isNaN(unixTimestamp)) {
        return true;
      }

      return unixTimestamp >= min && unixTimestamp <= max;
    });
  }, [geoJsonFeatures, timeRange, timeExtentFilter]);

  const handleCloseClick = useCallback(() => {
    setSelectedGeoJsonLayerId(undefined);
    setViewMode(VIEW_MODE.INITIAL);
    resetState();
  }, []);

  const handleEditOpenClick = useCallback(() => {
    setViewMode(VIEW_MODE.EDIT);
    setHorizontalLayoutMode(HORIZONTAL_LAYOUT_MODE.DRAW);
    selectedLayer.setVisibility(map, "none");

    resetState();
  }, [selectedLayer]);

  const handleEditCloseClick = useCallback(() => {
    selectedLayer.setVisibility(map, "visible");
    setViewMode(VIEW_MODE.INITIAL);
    setHorizontalLayoutMode(HORIZONTAL_LAYOUT_MODE.STANDARD);
  }, [selectedLayer]);

  const handleFeatureFilterClick = useCallback(() => {
    if (viewMode === VIEW_MODE.FILTER) {
      setViewMode(VIEW_MODE.INITIAL);
      previousTimeExtentFilter.current = timeExtentFilter;
      setTimeExtentFilter([]);
    } else {
      setViewMode(VIEW_MODE.FILTER);
      setTimeExtentFilter(previousTimeExtentFilter.current);
    }
  }, [viewMode, timeExtentFilter]);

  const handleGeoJsonDownloadClick = useCallback(() => {
    const geoJson = {
      type: "FeatureCollection",
      features: filteredFeatures,
    };

    const convertedGeoJson = GeoJsonLayer.toPersistence(geoJson);

    const jsonString = JSON.stringify(convertedGeoJson);
    const title = selectedLayer.getMetadata("title");
    triggerJsonDownload(title, jsonString);
  }, [filteredFeatures]);

  const handleFeatureClick = useCallback(
    (featureId) => {
      setSelectedGeoJsonFeatureIdentifier({
        featureId,
        sourceId: layerId,
      });
    },
    [layerId]
  );

  const resetState = useCallback(() => {
    setTimeExtentFilter([]);
    previousTimeExtentFilter.current = [];
  }, []);

  useEffect(() => {
    previousSelectedLayer.current = selectedLayer;

    return () => {
      // clear state when switching layers externally
      setViewMode(VIEW_MODE.INITIAL);
      resetState();
    };
  }, [selectedLayer]);

  useEffect(() => {
    if (!isDefined(selectedLayer)) {
      if (isDefined(previousSelectedLayer.current)) {
        previousSelectedLayer.current.setFilters(map);
      }

      return;
    }

    selectedLayer.setFilters(map, { timeExtent: timeExtentFilter });
  }, [selectedLayer, timeExtentFilter]);

  return (
    <>
      <div
        className={clsx(
          "vkf-geojson-layer-view-root",
          isDefined(selectedLayer) && "in"
        )}
      >
        {isDefined(selectedLayer) && (
          <>
            <GeoJsonPanelHeader
              title={translate("geojsonlayerpanel-header-title")}
              onEditClick={
                viewMode !== VIEW_MODE.EDIT ? handleEditOpenClick : undefined
              }
              onCloseClick={
                viewMode === VIEW_MODE.EDIT
                  ? handleEditCloseClick
                  : handleCloseClick
              }
            />
            <div className="headline-container">
              <div className="geojson-headline--date">
                {formattedTimePublished}
              </div>
              <div className="title-row">
                <div className="geojson-headline--title">{title}</div>
                <CustomButton
                  className="geojson-headline--button export-button"
                  disabled={filteredFeatures.length === 0}
                  onClick={handleGeoJsonDownloadClick}
                  title={translate("layermanagement-export-geojson")}
                >
                  <VkfIcon name="export-geojson" />
                </CustomButton>
                <CustomButton
                  className="geojson-headline--button filter-button"
                  disabled={viewMode === VIEW_MODE.EDIT || !isValidTimeRange}
                  onClick={handleFeatureFilterClick}
                  title={translate("layermanagement-filter-geojson-features")}
                >
                  <VkfIcon name="filter" />
                </CustomButton>
              </div>
            </div>

            <div
              className={clsx(
                "plain-divider",
                viewMode === VIEW_MODE.FILTER && isValidTimeRange && "filtered"
              )}
            >
              <span
                className={clsx(
                  "caret-container",
                  viewMode === VIEW_MODE.FILTER &&
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
                viewMode === VIEW_MODE.FILTER && isValidTimeRange && "in"
              )}
            >
              {viewMode !== VIEW_MODE.EDIT && isValidTimeRange && (
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
            <GeoJsonLayerFeatureList
              className={clsx(
                "geojson-layer-feature-list-root ",
                viewMode !== VIEW_MODE.EDIT && ["in", "scrollable"]
              )}
              features={filteredFeatures}
              onFeatureClick={handleFeatureClick}
            />

            <GeoJsonLayerEditPanel
              className={clsx(
                "geojson-layer-edit-panel-root",
                viewMode === VIEW_MODE.EDIT && "in"
              )}
            />
          </>
        )}
      </div>
    </>
  );
};

export default GeoJsonLayerView;
