import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

import { translate } from "../../../../../../util/util";

export const MapSearchSortColumn = ({ onClick, sortOrder, type }) => {
  const handleClick = () => {
    onClick(type);
  };

  const handleEnter = (e) => {
    if (e.keyCode === 13) {
      handleClick();
    }
  };

  const title =
    translate(`mapsearch-${type}`) === ""
      ? translate(type)
      : translate(`mapsearch-${type}`);

  return (
    <div className={clsx("inner-col", type)}>
      <div
        className={clsx("sort-element", type, sortOrder)}
        datatype={type}
        onClick={handleClick}
        onKeyDown={handleEnter}
        tabIndex={0}
      >
        {title}
        <span className="caret-container">
          <span className="caret caret-reversed" />
        </span>
      </div>
    </div>
  );
};

MapSearchSortColumn.propTypes = {
  onClick: PropTypes.func,
  sortOrder: PropTypes.string,
  type: PropTypes.string,
};

export default MapSearchSortColumn;
