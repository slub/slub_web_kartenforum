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
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import clsx from "clsx";

import MapSearchListElement from "../MapSearchListElement/MapSearchListElement";
import { isDefined } from "../../../../../../util/util";
import {
  mapsInViewportState,
  map3dState,
  mapSearchListFunctionalityProvidersState,
  mapState,
  selectedFeaturesState,
} from "../../../../atoms/atoms";
import { checkIfArrayContainsFeature } from "../../util";
import MapSearchSortColumn from "../MapSearchSortColumn/MapSearchSortColumn";
import MapSearchFunctionalityProvider from "../MapSearchFunctionalityProvider/MapSearchFunctionalityProvider";
import "./MapSearchResultList.scss";

const SEARCH_COLS = ["time", "title", "georeference"];
const DEFAULT_TYPE = "title";
// approximated height of a view item -> used for prefetching
const VIEW_ITEM_HEIGHT = 120;

const SORT_ORDERS = {
  ASCENDING: "ascending",
  DESCENDING: "descending",
};

export const MapSearchResultList = ({
  blockUpdate,
  direction = "vertical",
  onStartFetching,
  renderHeader = true,
}) => {
  // state
  const [{ activeType, sortOrder }, setSortOrder] = useState({
    activeType: DEFAULT_TYPE,
    sortOrder: SORT_ORDERS.ASCENDING,
  });
  const { maps, id } = useRecoilValue(mapsInViewportState);
  const map = useRecoilValue(mapState);
  const { mapPaginationSource } = useRecoilValue(
    mapSearchListFunctionalityProvidersState
  );
  const is3dEnabled = useRecoilValue(map3dState);
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );

  // Refs
  const searchListRef = useRef();

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
        return layer.getFeatureId() === feature.get("id");
      });

      map.removeLayer(layer);
    } else {
      setSelectedFeatures((selectedFeatures) => [
        ...selectedFeatures,
        { feature },
      ]);
    }
  };

  // Start prefetching new elements on scroll
  const handleScroll = useCallback(() => {
    if (
      searchListRef.current === null ||
      !isDefined(mapPaginationSource) ||
      blockUpdate
    )
      return;

    const scrollEl = searchListRef.current;
    if (
      scrollEl.offsetHeight + scrollEl.scrollTop >=
      // start fetching when there are onlu 3 items left before hitting end of the list
      scrollEl.scrollHeight - 3 * VIEW_ITEM_HEIGHT
    ) {
      onStartFetching();
      // check if there are still features to append
      if (!mapPaginationSource.isComplete()) mapPaginationSource.paginate_();
    }
  }, [blockUpdate, mapPaginationSource, searchListRef]);

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

    mapPaginationSource.setSortAttribute(type);
    mapPaginationSource.setSortOrder(newSortOrder);
    mapPaginationSource.refresh();
  };

  ////
  // Effect section
  ////

  // reset scroll if id of feature set changes
  useEffect(() => {
    const scrollEl = searchListRef.current;
    if (!isDefined(scrollEl)) {
      scrollEl.scrollTop = 0;
    }
  }, [id]);

  return (
    <div className={clsx("vkf-mapsearch-result-list", direction)}>
      {renderHeader && (
        <div className="list-header">
          {SEARCH_COLS.map((type) => (
            <MapSearchSortColumn
              key={type}
              onClick={handleUpdateSortType}
              sortOrder={activeType === type ? sortOrder : ""}
              type={type}
            />
          ))}
        </div>
      )}
      <div className="mapsearch-contentlist-container">
        <ul
          onScroll={handleScroll}
          className="mapsearch-contentlist"
          id="mapsearch-contentlist"
          ref={searchListRef}
        >
          {maps.map((feature) => (
            <MapSearchListElement
              direction={direction}
              feature={feature}
              is3d={is3dEnabled}
              key={feature.get("id")}
              onClick={handleElementClick}
              selected={checkIfArrayContainsFeature(selectedFeatures, feature)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

MapSearchResultList.propTypes = {
  blockUpdate: PropTypes.bool,
  direction: PropTypes.oneOf(["horizontal", "vertical"]),
  onStartFetching: PropTypes.func,
  renderHeader: PropTypes.bool,
};

/**
 * Wraps the MapSearchList in order to bundle it with the data supply
 * @returns {JSX.Element}
 * @constructor
 */
export const WrappedMapSearchResultList = (props) => {
  const [blockUpdate, setBlockUpdate] = useState(false);
  const setMapsInViewport = useSetRecoilState(mapsInViewportState);

  // update the global feature state
  const handleUpdate = (maps) => {
    setMapsInViewport(maps);
    setBlockUpdate(false);
  };

  return (
    <Fragment>
      <MapSearchFunctionalityProvider onUpdate={handleUpdate} />
      <MapSearchResultList
        blockUpdate={blockUpdate}
        onStartFetching={() => {
          setBlockUpdate(true);
        }}
        {...props}
      />
    </Fragment>
  );
};

WrappedMapSearchResultList.propTypes = {
  direction: PropTypes.oneOf(["horizontal", "vertical"]),
  renderHeader: PropTypes.bool,
};

export default WrappedMapSearchResultList;
