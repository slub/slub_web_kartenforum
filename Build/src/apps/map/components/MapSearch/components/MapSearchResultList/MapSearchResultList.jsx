/**
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useRecoilState, useRecoilValue } from "recoil";
import clsx from "clsx";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import Feature from "ol/Feature";

import MapSearchListElement from "../MapSearchListElement/MapSearchListElement";
import {
  searchResultDescriptorState,
  map3dState,
  mapState,
  selectedFeaturesState,
} from "../../../../atoms/atoms";
import { checkIfArrayContainsFeature } from "../../util";
import MapSearchSortColumn from "../MapSearchSortColumn/MapSearchSortColumn";
import MapSearchOverlayLayer from "../MapSearchOverlayLayer/MapSearchOverlayLayer";
import PaginatingDataController from "../../../PaginatingDataController/PaginatingDataController";
import { useSize } from "../../../../../../util/hooks";
import { translate } from "../../../../../../util/util";
import { LAYER_TYPES } from "../../../CustomLayers/LayerTypes";
import "./MapSearchResultList.scss";

const DEFAULT_TYPE = "title";
const SEARCH_COLS = ["map_scale", "time_published", "title", "georeference"];
const SORT_ORDERS = {
  ASCENDING: "ascending",
  DESCENDING: "descending",
};
export let LOADING_FEATURE = new Feature({
  has_georeference: true,
  map_scale: "0",
  thumb_url: "",
  time_published: "",
  title: "Loading",
});

export const MapSearchResultList = ({
  direction = "vertical",
  itemSize = 110,
  minimumBatchSize,
  onFetchResults,
  onUpdateSortType,
  renderHeader = true,
  sortSettings,
}) => {
  const { activeType, sortOrder } = sortSettings;

  // state
  const { mapCount, id } = useRecoilValue(searchResultDescriptorState);
  const map = useRecoilValue(mapState);
  const is3dEnabled = useRecoilValue(map3dState);
  const [items, setItems] = useState({});
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );

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
        });
      }
    },
    [onFetchResults]
  );

  ////
  // Handler section
  ////

  // Toggle selected state of fature and update global state
  const handleElementClick = (feature) => {
    const containsFeature = checkIfArrayContainsFeature(
      selectedFeatures,
      feature
    );

    // remove feature if it is already contained
    if (containsFeature) {
      // remove from selectedFeaturesList
      setSelectedFeatures((selectedFeatures) =>
        selectedFeatures.filter(
          ({ feature: selFeature }) =>
            selFeature.get("id") !== feature.get("id")
        )
      );

      // remove map layer
      const layers = map
        .getLayers()
        .getArray()
        .filter((lay) => lay.allowUseInLayerManagement);
      const layer = layers.find((layer) => {
        return layer.getId() === feature.get("id");
      });

      map.removeLayer(layer);
    } else {
      setSelectedFeatures((selectedFeatures) => [
        ...selectedFeatures,
        { feature, type: LAYER_TYPES.HISTORIC_MAP },
      ]);
    }
  };

  ////
  // Effect section
  ////

  // initialize title of the loading feature (has to be done here, because of translation)
  useEffect(() => {
    LOADING_FEATURE.set("title", translate("mapsearch-listelement-loading"));
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
          itemCount={mapCount}
          loadMoreItems={loadMoreItems}
          minimumBatchSize={minimumBatchSize}
          ref={refInfiniteLoader}
        >
          {({ onItemsRendered, ref }) => (
            <List
              layout={direction}
              height={height}
              width={width}
              onItemsRendered={onItemsRendered}
              itemCount={mapCount}
              itemSize={itemSize}
              itemData={{
                direction,
                maps: items,
                is3d: is3dEnabled,
                onClick: handleElementClick,
              }}
              ref={ref}
            >
              {MapSearchListElement}
            </List>
          )}
        </InfiniteLoader>
      </div>
    </div>
  );
};

MapSearchResultList.propTypes = {
  direction: PropTypes.oneOf(["horizontal", "vertical"]),
  itemSize: PropTypes.number,
  minimumBatchSize: PropTypes.number,
  renderHeader: PropTypes.bool,
  onFetchResults: PropTypes.func,
  onUpdateSortType: PropTypes.func,
  sortSettings: PropTypes.shape({
    activeType: PropTypes.string,
    sortOrder: PropTypes.string,
  }),
};

/**
 * Wraps the MapSearchList in order to bundle it with the data supply
 * @returns {JSX.Element}
 * @constructor
 */
export const WrappedMapSearchResultList = (props) => {
  // state
  const [sortSettings, setSortOrder] = useState({
    activeType: DEFAULT_TYPE,
    sortOrder: SORT_ORDERS.ASCENDING,
  });

  // derived
  const { activeType, sortOrder } = sortSettings;

  ////
  // Handler section
  ////

  // Set field by which is sorted and toggle sort oder
  const handleUpdateSortType = (type) => {
    const newSortOrder =
      type === activeType
        ? sortOrder === SORT_ORDERS.ASCENDING
          ? SORT_ORDERS.DESCENDING
          : SORT_ORDERS.ASCENDING
        : SORT_ORDERS.ASCENDING;

    setSortOrder({
      sortOrder: newSortOrder,
      activeType: type,
    });
  };

  ////
  // Render helper
  ////

  const renderMapSearchResultList = (extraProps) => {
    return (
      <MapSearchResultList
        onUpdateSortType={handleUpdateSortType}
        sortSettings={sortSettings}
        {...props}
        {...extraProps}
      />
    );
  };

  return (
    <Fragment>
      <MapSearchOverlayLayer sortSettings={sortSettings} />
      <PaginatingDataController
        renderConsumer={renderMapSearchResultList}
        sortSettings={sortSettings}
      />
    </Fragment>
  );
};

WrappedMapSearchResultList.propTypes = {
  direction: PropTypes.oneOf(["horizontal", "vertical"]),
  renderHeader: PropTypes.bool,
};

export default WrappedMapSearchResultList;
