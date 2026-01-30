/*
 * Created by tom.schulze@pikobytes.de on 08.09.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { translate } from "@util/util";
import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import SortColumn from "./SortColumn";
import "./SortControl.scss";

export const SORT_STATE = {
  ASCENDING: "ascending",
  DESCENDING: "descending",
};

const SortControl = ({
  sortColumns,
  onUpdateSortOrder,
  defaultSortKey = "title",
  defaultSortOrder = SORT_STATE.ASCENDING,
}) => {
  const [activeSortKey, setActiveSortKey] = useState(defaultSortKey);
  const [activeSortKeyOrder, setActiveSortKeyOrder] =
    useState(defaultSortOrder);

  const handleClick = useCallback(
    (newSortKey, newSortOrder) => {
      setActiveSortKey(newSortKey);
      setActiveSortKeyOrder(newSortOrder);
      onUpdateSortOrder(newSortKey, newSortOrder);
    },
    [onUpdateSortOrder, activeSortKeyOrder]
  );

  return (
    <div className="vkf-sort-control-root">
      <div className="list-header">
        <strong className="list-label">
          {translate("mapsearch-sorting")}:
        </strong>
        <div className="inner-columns">
          {sortColumns.map(({ sortKey, label }) => (
            <SortColumn
              key={sortKey}
              onClick={handleClick}
              sortOrder={activeSortKey === sortKey ? activeSortKeyOrder : ""}
              sortKey={sortKey}
              label={label}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

SortControl.propTypes = {
  sortColumns: PropTypes.arrayOf(
    PropTypes.shape({ sortKey: PropTypes.string, label: PropTypes.string })
  ).isRequired,
  onUpdateSortOrder: PropTypes.func,
  defaultSortKey: PropTypes.string,
  defaultSortOrder: PropTypes.oneOf([
    SORT_STATE.ASCENDING,
    SORT_STATE.DESCENDING,
  ]),
};

export default SortControl;
