/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useMemo } from "react";
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
  MM: "type-mosaic",
};

const initialCheckedState = {};
Object.keys(FACETED_SEARCH_TYPES).forEach((key) => {
  initialCheckedState[key] = false;
});

export const FacetedSearch = ({ georeferenceMode, mosaicMode }) => {
  const [facets, setFacets] = useRecoilState(facetState);

  // Conditionally remove the Mosaic map filter from the filter facet if mosaic mode is enabled
  const facetedSearchTypes = useMemo(() => {
    const filteredFacetedSearchTypes = { ...FACETED_SEARCH_TYPES };

    if (mosaicMode) {
      delete filteredFacetedSearchTypes.MM;
    }

    return filteredFacetedSearchTypes;
  }, [mosaicMode]);

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
          const [facetKey, facetValue] = facetedSearchTypes[key].split("-");
          newFacets.push({ key: facetKey, value: facetValue, id: key });
        }
        return { facets: newFacets, georeference };
      }
    });
  };

  return (
    <ul className="search-facet">
      {Object.keys(facetedSearchTypes).map((key) => (
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
  mosaicMode: PropTypes.bool,
};

export default FacetedSearch;
