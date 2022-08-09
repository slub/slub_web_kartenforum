/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { Fragment, useState } from "react";
import MapSearchOverlayLayer from "../MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";
import PropTypes from "prop-types";
import { MapSearchResultListBase } from "./MapSearchResultListBase.jsx";

const DEFAULT_TYPE = "title";
const SORT_ORDERS = {
  ASCENDING: "ascending",
  DESCENDING: "descending",
};

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
      <MapSearchResultListBase
        onUpdateSortType={handleUpdateSortType}
        sortSettings={sortSettings}
        {...props}
        {...extraProps}
      />
    );
  };

  return (
    <Fragment>
      {enableOverlayLayer && (
        <MapSearchOverlayLayer sortSettings={sortSettings} />
      )}
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
