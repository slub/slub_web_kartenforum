/**
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import clsx from "clsx";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import Feature from "ol/Feature";

import { map3dState } from "../../../../atoms/atoms";
import MapSearchSortColumn from "../MapSearchSortColumn/MapSearchSortColumn";
import { useSize } from "../../../../../../util/hooks";
import { translate } from "../../../../../../util/util";
import "./MapSearchResultList.scss";
import MapSearchListElement from "../MapSearchListElement/MapSearchListElement.jsx";
import { HistoricMapLayer } from "../../../CustomLayers/HistoricMapLayer.js";

const SEARCH_COLS = ["map_scale", "time_published", "title", "georeference"];

export let LOADING_FEATURE = new HistoricMapLayer({
  metadata: {
    has_georeference: true,
    map_scale: "0",
    thumb_url: "",
    time_published: "",
    title: "Loading",
  },
});

export const MapSearchResultListBase = ({
  direction = "vertical",
  itemSize = 110,
  ListItemComponent = MapSearchListElement,
  minimumBatchSize,
  onFetchResults,
  onUpdateSortType,
  renderHeader = true,
  searchResultDescriptor: { itemCount, id },
  sortSettings,
}) => {
  const { activeType, sortOrder } = sortSettings;

  // state
  const is3dEnabled = useRecoilValue(map3dState);
  const [items, setItems] = useState({});

  // Refs
  const refClearResults = useRef(false);
  const refInfiniteLoader = useRef();
  const refSearchList = useRef();

  const { height, width } = useSize(refSearchList);

  // determines whether an item has to be fetched or not
  const isItemLoaded = useCallback(
    (index) =>
      !refClearResults.current &&
      items[index] !== undefined &&
      items[index] !== LOADING_FEATURE,
    [items]
  );

  // fetches all items from startIndex to stopIndex (both ends inclusive)
  const loadMoreItems = useCallback(
    (startIndex, stopIndex) => {
      if (startIndex !== undefined && stopIndex !== undefined) {
        // store indices for later usage
        const size = stopIndex - startIndex + 1;

        return onFetchResults(startIndex, size).then((res) => {
          if (res) {
            setItems((oldItems) => {
              const newItems = refClearResults.current
                ? {}
                : Object.assign({}, oldItems);

              refClearResults.current = false;

              res.forEach((map, index) => {
                newItems[startIndex + index] = map;
              });
              return newItems;
            });
          }
        });
      }
    },
    [onFetchResults]
  );

  ////
  // Effect section
  ////

  // initialize title of the loading feature (has to be done here, because of translation)
  useEffect(() => {
    LOADING_FEATURE.updateMetadata(
      "title",
      translate("mapsearch-listelement-loading")
    );
  }, []);

  // reset caches on change of the result set id
  useEffect(() => {
    refClearResults.current = true;
    refInfiniteLoader.current.resetloadMoreItemsCache(true);
  }, [id]);

  return (
    <div className={clsx("vkf-mapsearch-result-list", direction)}>
      {renderHeader && (
        <div className="list-header">
          <strong className="list-label">
            {translate("mapsearch-sorting")}:
          </strong>
          <div className="inner-columns">
            {SEARCH_COLS.map((type) => (
              <MapSearchSortColumn
                key={type}
                onClick={onUpdateSortType}
                sortOrder={activeType === type ? sortOrder : ""}
                type={type}
              />
            ))}
          </div>
        </div>
      )}
      <div className="mapsearch-contentlist-container" ref={refSearchList}>
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
          minimumBatchSize={minimumBatchSize}
          ref={refInfiniteLoader}
        >
          {({ onItemsRendered, ref }) => (
            <List
              height={height}
              innerElementType="ul"
              itemCount={itemCount}
              itemSize={itemSize}
              itemData={{
                direction,
                maps: items,
                is3d: is3dEnabled,
              }}
              layout={direction}
              onItemsRendered={onItemsRendered}
              ref={ref}
              width={width}
            >
              {ListItemComponent}
            </List>
          )}
        </InfiniteLoader>
      </div>
    </div>
  );
};

MapSearchResultListBase.propTypes = {
  direction: PropTypes.oneOf(["horizontal", "vertical"]),
  itemSize: PropTypes.number,
  minimumBatchSize: PropTypes.number,
  ListItemComponent: PropTypes.elementType,
  renderHeader: PropTypes.bool,
  onFetchResults: PropTypes.func,
  onUpdateSortType: PropTypes.func,
  searchResultDescriptor: PropTypes.shape({
    id: PropTypes.number,
    itemCount: PropTypes.number,
  }),
  sortSettings: PropTypes.shape({
    activeType: PropTypes.string,
    sortOrder: PropTypes.string,
  }),
};

export default MapSearchResultListBase;
