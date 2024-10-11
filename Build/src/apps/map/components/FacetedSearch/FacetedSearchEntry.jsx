/**
 * Created by nicolas.looschen@pikobytes.de on 17/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import React from "react";
import PropTypes from "prop-types";

import { translate } from "@util/util";

export const FacetedSearchEntry = ({
  checked,
  georeferenceMode,
  id,
  onClick,
}) => {
  const title = translate(`facet-${id.toLowerCase()}`);

  const handleClick = () => {
    onClick(id);
  };

  return id !== "ToGeoref" || (id === "toGeoref" && georeferenceMode) ? (
    <li>
      <label htmlFor={id}>
        <input
          checked={checked}
          className="facet-search-el"
          onChange={handleClick}
          id={id}
          title={title}
          type="checkbox"
        />
        <span dangerouslySetInnerHTML={{ __html: title }} />
      </label>
    </li>
  ) : (
    <></>
  );
};

FacetedSearchEntry.propTypes = {
  checked: PropTypes.bool,
  georeferenceMode: PropTypes.bool,
  id: PropTypes.string,
  onClick: PropTypes.func,
};

export default FacetedSearchEntry;
