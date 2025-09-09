/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { Fragment, useCallback, useState } from "react";
import MapSearchOverlayLayer from "../MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";
import PropTypes from "prop-types";
import { MapSearchResultListBase } from "./MapSearchResultListBase.jsx";
import { SORT_STATE } from "@components/SortControl/SortControl.jsx";

export const DEFAULT_SORT_KEY = "title";
export const DEFAULT_SORT_ORDER = SORT_STATE.ASCENDING;

/**
 * Wraps the MapSearchList in order to bundle it with the data supply
 * @returns {JSX.Element}
 * @constructor
 */
export const WrappedMapSearchResultList = ({
  customQuery,
  DataProvider,
  enableOverlayLayer = true,
  ...props
}) => {
  // state
  const [sortSettings, setSortOrder] = useState({
    activeType: DEFAULT_SORT_KEY,
    sortOrder: DEFAULT_SORT_ORDER,
  });

  ////
  // Handler section
  ////

  // Set field by which is sorted and toggle sort oder
  const handleUpdateSortType = useCallback((newSortKey, newSortOrder) => {
    setSortOrder({
      sortOrder: newSortOrder,
      activeType: newSortKey,
    });
  }, []);

  ////
  // Render helper
  ////

  const renderMapSearchResultList = (extraProps) => {
    return (
      <MapSearchResultListBase
        onUpdateSortType={handleUpdateSortType}
        {...props}
        {...extraProps}
      />
    );
  };

  return (
    <Fragment>
      {enableOverlayLayer && <MapSearchOverlayLayer />}
      <DataProvider
        customQuery={customQuery}
        renderConsumer={renderMapSearchResultList}
        sortSettings={sortSettings}
      />
    </Fragment>
  );
};

WrappedMapSearchResultList.propTypes = {
  DataProvider: PropTypes.elementType.isRequired,
  enableOverlayLayer: PropTypes.bool,
  ...MapSearchResultListBase.propTypes,
};

export default WrappedMapSearchResultList;
