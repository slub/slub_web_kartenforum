/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { useSetRecoilState } from "recoil";
import { facetState } from "../../atoms/atoms";
import FacetedSearchEntry from "./FacetedSearchEntry";

export const FACETED_SEARCH_TYPES = {
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

const initialCheckedState = {};
Object.keys(FACETED_SEARCH_TYPES).forEach((key) => {
  initialCheckedState[key] = false;
});

export const FacetedSearch = (props) => {
  const { georeferenceMode } = props;

  const [checkedState, setCheckedState] = useState(initialCheckedState);

  const setFacets = useSetRecoilState(facetState);

  const handleToggleFacet = (key) => {
    setCheckedState((oldCheckedState) =>
      Object.assign({}, oldCheckedState, { [key]: !oldCheckedState[key] })
    );
  };

  useEffect(() => {
    const selected = Object.entries(checkedState)
      .filter((entry) => entry[1])
      .map((entry) => entry[0]);

    const facets = [];
    selected.forEach((key) => {
      if (key === "ToGeoref") return;
      const [facetKey, facetValue] = FACETED_SEARCH_TYPES[key].split("-");
      facets.push({ key: facetKey, value: facetValue });
    });

    setFacets({ facets, georeference: !selected.includes("ToGeoref") });
  }, [checkedState]);

  return (
    <div className="search-facet">
      {Object.keys(FACETED_SEARCH_TYPES).map((key) => (
        <FacetedSearchEntry
          checked={checkedState[key]}
          key={key}
          georeferenceMode={georeferenceMode}
          onClick={handleToggleFacet}
          id={key}
        />
      ))}
    </div>
  );
};

FacetedSearch.propTypes = {
  georeferenceMode: PropTypes.bool,
};

export default FacetedSearch;
