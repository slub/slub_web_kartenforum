import React, { useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

import { translate } from "@util/util";

const type_to_translation_key = {
  time_period_start: "mapsearch-time",
  title: "mapsearch-title",
  map_scale: "mapsearch-map_scale",
  georeference: "mapsearch-georeference",
};

export const MapSearchSortColumn = ({ onClick, sortOrder, type }) => {
  const handleClick = () => {
    onClick(type);
  };

  const handleEnter = (e) => {
    if (e.keyCode === 13) {
      handleClick();
    }
  };

  const title = useMemo(() => {
    const translationKey = type_to_translation_key[type];
    return translate(translationKey);
  }, [type]);

  return (
    <div className={clsx("inner-col", type)}>
      <div
        className={clsx("sort-element", type, sortOrder)}
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
