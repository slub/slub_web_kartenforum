/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import { useRecoilState } from "recoil";

import { facetState } from "../../atoms/atoms";
import FacetedSearchEntry from "./FacetedSearchEntry";
import "./FacetedSearch.scss";

export const FACETED_SEARCH_TYPES = {
  AE: "map_type-ae",
  AK: "map_type-ak",
  CM: "map_type-cm",
  GL: "map_type-gl",
  MB: "map_type-mb",
  MTB: "map_type-mtb",
  TK: "map_type-tk",
  TKX: "map_type-tkx",
};

const initialCheckedState = {};
Object.keys(FACETED_SEARCH_TYPES).forEach((key) => {
  initialCheckedState[key] = false;
});

export const FacetedSearch = ({ georeferenceMode }) => {
  const [facets, setFacets] = useRecoilState(facetState);

  ////
  // Handler section
  ////

  const handleToggleFacet = (key) => {
    setFacets((oldFacets) => {
      const { facets, georeference } = oldFacets;

      // toggle georef key
      if (key === "ToGeoref") {
        return { facets, georeference: !georeference };
      } else {
        // else either add facet or remove it if it is already present
        const newFacets = facets.slice();
        const index = newFacets.findIndex((f) => f.id === key);

        if (index > -1) {
          newFacets.splice(index, 1);
        } else {
          const [facetKey, facetValue] = FACETED_SEARCH_TYPES[key].split("-");
          newFacets.push({ key: facetKey, value: facetValue, id: key });
        }
        return { facets: newFacets, georeference };
      }
    });
  };

  return (
    <ul className="search-facet">
      {Object.keys(FACETED_SEARCH_TYPES).map((key) => (
        <FacetedSearchEntry
          checked={facets.facets.findIndex((f) => f.id === key) !== -1}
          key={key}
          georeferenceMode={georeferenceMode}
          onClick={handleToggleFacet}
          id={key}
        />
      ))}
    </ul>
  );
};

FacetedSearch.propTypes = {
  georeferenceMode: PropTypes.bool,
};

export default FacetedSearch;
