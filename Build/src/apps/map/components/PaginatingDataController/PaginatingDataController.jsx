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
import { transformExtent } from "ol/proj";

import {
  elementsScreenSizeState,
  facetState,
  map3dState,
  mapCountState,
  mapState,
  timeExtentState,
  timeRangeState,
  searchIsLoadingState,
  defaultTimeRange,
  layoutState,
} from "../../atoms/atoms";
import { isDefined } from "../../../../util/util";
import { createStatisticQuery, getSpatialQuery } from "../../../../util/query";
import { readFeatures } from "../../../../util/parser";
import SettingsProvider from "../../../../SettingsProvider";
import { MAP_PROJECTION } from "../MapSearch/MapSearch";
import { getSearchExtent, limitExtent } from "./util";
import { useDebounce } from "../../../../util/hooks";

export const PaginatingDataController = ({
  customQuery,
  projection = MAP_PROJECTION,
  minimumBatchSize = 20,
  renderConsumer,
  sortSettings,
}) => {
  // props
  const { activeType: sortAttribute, sortOrder } = sortSettings;

  // state
  const elementsScreenSize = useRecoilValue(elementsScreenSizeState);
  const { facets } = useRecoilValue(facetState);
  const is3dEnabled = useRecoilValue(map3dState);
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
  const elasticsearch_srs = "EPSG:4326";

  /**
   * @param {Array.<number>} extent An array of numbers representing an extent: [minx, miny, maxx, maxy]
   * @param {string} projection
   * @return {Object}
   * @private
   */
  const createSearchRequest = useCallback(
    (extent, projection) => {
      const sortOrd_ = sortOrder === "ascending" ? "asc" : "desc";

      // build response with bbox filter
      const envelope = limitExtent([
        [extent[0], extent[3]],
        [extent[2], extent[1]],
      ]);

      return getSpatialQuery(
        "time_published",
        timeExtent.map((el) => `${el}-01-01`),
        "geometry",
        envelope,
        sortAttribute,
        sortOrd_,
        facets,
        customQuery
      );
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

            return opt_raw
              ? data
              : readFeatures(
                  data["hits"]["hits"],
                  elasticsearch_srs,
                  "ESPG:4326",
                  is3dEnabled
                );
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
      const [bottomLeftPixel, topRightPixel] = getSearchExtent(
        elementsScreenSize,
        layout
      );

      // get equivalent coordinates
      const llc = map.unproject(bottomLeftPixel).toArray();
      const urc = map.unproject(topRightPixel).toArray();

      // if the map is for whatever reason not available, just skip the update and try again later
      if (llc === null || urc === null) {
        return;
      }

      const newMapView = [llc[0], llc[1], urc[0], urc[1]];

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
    const payload = createStatisticQuery("time_published");
    axios.post(requestUrl, payload, {}).then((resp) => {
      if (resp.status === 200) {
        const data = resp.data;
        const max = new Date(data["aggregations"]["summary"]["max"]),
          min = new Date(data["aggregations"]["summary"]["min"]);

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
