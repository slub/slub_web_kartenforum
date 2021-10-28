/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import { translate } from "../../util/util";
import { useSetRecoilState } from "recoil";
import { facetState } from "../../atoms/atoms";

const FACETED_SEARCH_TYPES = {
  AE: "maptype-ae",
  AK: "maptype-ak",
  CM: "maptype-cm",
  GL: "maptype-gl",
  MB: "maptype-mb",
  MTB: "maptype-mtb",
  TK: "maptype-tk",
  TKX: "maptype-tkx",
  ToGeoref: "georeference-false",
};

export const FacetedSearch = (props) => {
  const { georeferenceMode } = props;
  const setFacets = useSetRecoilState(facetState);

  const handleClick = (event) => {
    // get all checked values

    const elements = document.getElementsByClassName("facet-search-el"),
      checkedEl = [];
    let georeference = true;

    for (let i = 0; i < elements.length; i++) {
      if (elements[i].checked) {
        const key = elements[i].value.split("-")[0],
          value = elements[i].value.split("-")[1];

        if (key !== "georeference") checkedEl.push({ key: key, value: value });

        if (key === "georeference") georeference = false;
      }
    }

    setFacets({ facets: checkedEl, georeference });
  };

  const renderLabel = (key) => {
    const title = translate(`facet-${key.toLowerCase()}`);
    return key !== "toGeoref" || (key === "toGeoref" && georeferenceMode) ? (
      <label className="checkbox-inline" title={title}>
        <input
          className="facet-search-el"
          type="checkbox"
          id={key}
          title={title}
          value={FACETED_SEARCH_TYPES[key]}
        />
        {title}
      </label>
    ) : (
      <></>
    );
  };

  return (
    <div className="search-facet" onClick={handleClick}>
      {Object.keys(FACETED_SEARCH_TYPES).map(renderLabel)}
    </div>
  );
};

FacetedSearch.propTypes = {
  georeferenceMode: PropTypes.bool,
};

export default FacetedSearch;
