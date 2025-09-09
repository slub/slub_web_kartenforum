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
import { equals } from "ol/extent";

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
import { getSearchExtent, limitExtent } from "./util";
import { useDebounce } from "@util/hooks";
import { LngLatBounds } from "maplibre-gl";
import { SORT_STATE } from "@components/SortControl/SortControl";

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
  const [mapView, setMapView] = useState(undefined);
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
   * @param {Array.<number>} extent An array of numbers representing an extent: [minx, miny, maxx, maxy]
   * @return {Object}
   * @private
   */
  const createSearchRequest = useCallback(
    (extent) => {
      const sortOrd_ = sortOrder === SORT_STATE.ASCENDING ? "asc" : "desc";

      // build response with bbox filter
      const envelope = limitExtent([
        [extent[0], extent[3]],
        [extent[2], extent[1]],
      ]);

      return getSpatialQuery({
        timePeriodStartFieldName: "time_period_start",
        timePeriodEndFieldName: "time_period_end",
        timeValues: [`${timeExtent[0]}-01-01`, `${timeExtent[1]}-12-31`],
        bboxFieldName: "geometry",
        bboxPolygon: envelope,
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
      if (mapView === undefined) {
        setIsSearchLoading(false);
        return new Promise((res) => res([]));
      }
      // build elasticsearch request
      const requestPayload = createSearchRequest(mapView, "ESPG:4326");
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
    [createSearchRequest, mapView]
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
  const handleUpdateMapView = useCallback(() => {
    if (isDefined(map)) {
      const screenCorners = getSearchExtent(elementsScreenSize, layout);

      // get equivalent coordinates
      const lngLatBounds = new LngLatBounds();
      screenCorners.forEach((corner) => {
        const coord = map.unproject(corner);
        lngLatBounds.extend(coord);
      });

      const newMapView = lngLatBounds.toArray().flat();

      if (mapView === undefined || !equals(newMapView, mapView)) {
        setMapView(newMapView);
      }
    }
  }, [map, mapView, elementsScreenSize]);

  ////
  // Effect section
  ////

  // bind event handler on map
  useEffect(() => {
    if (isDefined(map)) {
      map.on("moveend", handleUpdateMapView);
      return () => {
        map.off("moveend", handleUpdateMapView);
      };
    }
  }, [map, handleUpdateMapView]);

  // if the map view changes, reset the state and fetch new results
  useEffect(() => {
    handleRefreshDebounced();
  }, [facets, handleRefresh, mapView, sortAttribute, sortOrder, timeExtent]);

  // manually update the internal map view on change of element size
  useEffect(() => {
    handleUpdateMapView();
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
