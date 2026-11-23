/*
 * Created by tom.schulze@pikobytes.de on 08.09.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { SORT_STATE } from "./constants";

const getNewSortState = (old) => {
  if (old === SORT_STATE.ASCENDING) {
    return SORT_STATE.DESCENDING;
  }
  return SORT_STATE.ASCENDING;
};

const SortColumn = ({ label, sortOrder, sortKey, onClick, fixedSortOrder }) => {
  const handleClick = useCallback(() => {
    const newSortOrder = fixedSortOrder ?? getNewSortState(sortOrder);
    onClick(sortKey, newSortOrder);
  }, [sortKey, sortOrder, onClick, fixedSortOrder]);

  const handleEnterKey = useCallback(
    (event) => {
      if (event.key === "Enter") {
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div className={clsx("inner-col", sortKey)}>
      <div
        className={clsx("sort-element", sortKey, sortOrder)}
        onClick={handleClick}
        onKeyDown={handleEnterKey}
        tabIndex={0}
      >
        {label}
        {!fixedSortOrder && (
          <span className="caret-container">
            <span className="caret caret-reversed" />
          </span>
        )}
      </div>
    </div>
  );
};

SortColumn.propTypes = {
  label: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  sortKey: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  fixedSortOrder: PropTypes.oneOf([SORT_STATE.ASCENDING, SORT_STATE.DESCENDING]),
};

export default SortColumn;
