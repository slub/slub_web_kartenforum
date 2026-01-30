/**
 * Created by nicolas.looschen@pikobytes.de on 09/12/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import axios from "axios";

import {
  elementsScreenSizeState,
  facetState,
  mapCountState,
  mapState,
  timeExtentState,
  timeRangeState,
  searchIsLoadingState,
  defaultTimeRange,
  layoutState,
} from "@map/atoms";
import { isDefined } from "@util/util";
import { createMinMaxYearQuery, getSpatialQuery } from "@util/query";
import { readLayers } from "@util/parser";
import SettingsProvider from "@settings-provider";
import {
  getSearchExtentWithSamplingVertices,
  mapPointsToSearchPolygons,
} from "./util";
import { useDebounce } from "@util/hooks";
import { SORT_STATE } from "@components/SortControl/SortControl";
import DebugRenderSearchArea from "@map/components/PaginatingDataController/debug/DebugRenderSearchArea.jsx";

function _equals(a, b) {
  if (a.length !== b.length) return false;
  return a.every((obj, i) => JSON.stringify(obj) === JSON.stringify(b[i]));
}

export const PaginatingDataController = ({
  customQuery,
  minimumBatchSize = 20,
  renderConsumer,
  sortSettings,
}) => {
  // props
  const { activeType: sortAttribute, sortOrder } = sortSettings;

  // state
  const elementsScreenSize = useRecoilValue(elementsScreenSizeState);
  const { facets } = useRecoilValue(facetState);
  const layout = useRecoilValue(layoutState);
  const map = useRecoilValue(mapState);
  const [spatialSearchView, setSpatialSearchView] = useState(undefined);
  const setIsSearchLoading = useSetRecoilState(searchIsLoadingState);
  const setMapsInViewport = useSetRecoilState(mapCountState);
  const [timeRange, setTimeRange] = useRecoilState(timeRangeState);
  const [timeExtent, setTimeExtent] = useRecoilState(timeExtentState);
  const [searchResultDescriptor, setSearchResultDescriptor] = useState({
    itemCount: 10,
    id: Date.now(),
  });

  // derived
  const settings = SettingsProvider.getSettings();
  const elasticsearch_node = settings.API_SEARCH;

  /**
   * @param {Array.<GeoJSONFeature>} Array of GeoJSON features representing the search area
   * @return {Object}
   * @private
   */
  const createSearchRequest = useCallback(
    (searchArea) => {
      const sortOrd_ = sortOrder === SORT_STATE.ASCENDING ? "asc" : "desc";
      const searchPolygons = searchArea
        .filter((ft) => ft?.geometry?.type === "Polygon")
        .map((ft) => ft.geometry.coordinates);

      return getSpatialQuery({
        timePeriodStartFieldName: "time_period_start",
        timePeriodEndFieldName: "time_period_end",
        timeValues: [`${timeExtent[0]}-01-01`, `${timeExtent[1]}-12-31`],
        geometrySearchFieldName: "geometry",
        geometrySearchPolygons: searchPolygons,
        sortFieldName: sortAttribute,
        sortValue: sortOrd_,
        facets,
        customQueryExtension: customQuery,
      });
    },
    [facets, sortAttribute, sortOrder, timeExtent]
  );

  // fetch the results from the index
  const fetchResults = useCallback(
    (start, size, opt_raw = false) => {
      if (spatialSearchView === undefined) {
        setIsSearchLoading(false);
        return new Promise((res) => res([]));
      }
      // build elasticsearch request
      const requestPayload = createSearchRequest(spatialSearchView);
      const requestUrl =
        elasticsearch_node + "/_search?from=" + start + "&size=" + size;

      // signalize a fetch process is about to begin
      setIsSearchLoading(true);
      return axios
        .post(requestUrl, requestPayload)
        .then((resp) => {
          if (resp.status === 200) {
            const data = resp.data;

            return opt_raw ? data : readLayers(data["hits"]["hits"]);
          }
        })
        .catch((e) => {
          console.warn(e);
        })
        .finally(() => {
          // signalize the search process has ended
          setIsSearchLoading(false);
        });
    },
    [createSearchRequest, spatialSearchView]
  );

  ////
  // Handler section
  ////

  const handleRefresh = useCallback(() => {
    fetchResults(0, 0, true).then((data) => {
      const mapCount = data["hits"]["total"]["value"];
      setMapsInViewport(mapCount);
      setSearchResultDescriptor({ itemCount: mapCount, id: Date.now() });
    });
  }, [fetchResults]);

  // Update search result set id on reset of any of the search parameters, but only do it every so often
  const handleRefreshDebounced = useDebounce(handleRefresh, 30);

  // handles an update of the internally kept map extent
  // either triggered by a map move or a resize of some component
  const handleUpdateSpatialSearchView = useCallback(() => {
    if (isDefined(map)) {
      const searchAreaPointsPX = getSearchExtentWithSamplingVertices(
        elementsScreenSize,
        layout,
        map.getZoom()
      );
      const newSearchArea = mapPointsToSearchPolygons(searchAreaPointsPX, map);

      if (
        spatialSearchView === undefined ||
        !_equals(newSearchArea, spatialSearchView)
      ) {
        setSpatialSearchView(newSearchArea);
      }
    }
  }, [map, spatialSearchView, elementsScreenSize]);

  ////
  // Effect section
  ////

  // bind event handler on map
  useEffect(() => {
    if (isDefined(map)) {
      map.on("moveend", handleUpdateSpatialSearchView);
      return () => {
        map.off("moveend", handleUpdateSpatialSearchView);
      };
    }
  }, [map, handleUpdateSpatialSearchView]);

  // if the map view changes, reset the state and fetch new results
  useEffect(() => {
    handleRefreshDebounced();
  }, [
    facets,
    handleRefresh,
    spatialSearchView,
    sortAttribute,
    sortOrder,
    timeExtent,
  ]);

  // manually update the internal map view on change of element size
  useEffect(() => {
    handleUpdateSpatialSearchView();
  }, [elementsScreenSize, map]);

  // determine initial time filter
  useEffect(() => {
    const requestUrl = `${elasticsearch_node}/_search?`;
    const payload = createMinMaxYearQuery(
      "time_period_start",
      "time_period_end"
    );
    axios.post(requestUrl, payload, {}).then((resp) => {
      if (resp.status === 200) {
        const data = resp.data;
        const max = new Date(data["aggregations"]["maxYear"]["value"]),
          min = new Date(data["aggregations"]["minYear"]["value"]);

        const newRange = [min.getUTCFullYear(), max.getUTCFullYear()];

        // reset the range and extent only if the range was still the default range or if the range has changed
        if (
          timeRange === undefined ||
          defaultTimeRange === timeRange ||
          newRange[0] !== timeRange[0] ||
          newRange[1] !== timeRange[1]
        ) {
          setTimeRange(newRange);
          setTimeExtent(newRange);
        }
      }
    });
  }, []);

  return (
    <React.Fragment>
      {renderConsumer({
        minimumBatchSize,
        onRefresh: handleRefresh,
        onFetchResults: fetchResults,
        searchResultDescriptor,
      })}
      {SettingsProvider.isDebug() && (
        <DebugRenderSearchArea features={spatialSearchView} />
      )}
    </React.Fragment>
  );
};

PaginatingDataController.propTypes = {
  customQuery: PropTypes.array,
  minimumBatchSize: PropTypes.number,
  projection: PropTypes.string,
  renderConsumer: PropTypes.func,
  sortSettings: PropTypes.shape({
    activeType: PropTypes.string,
    sortOrder: PropTypes.string,
  }),
};

export default PaginatingDataController;
