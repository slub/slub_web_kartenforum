import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

import { translate } from "../../../../../../util/util";

export const MapSearchSortColumn = ({ onClick, sortOrder, type }) => {
  const handleClick = () => {
    onClick(type);
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
      >
        {title}
        <span className="caret caret-reversed" />
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
