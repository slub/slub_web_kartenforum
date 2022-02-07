/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import clsx from "clsx";

import {
  searchIsLoadingState,
  searchResultDescriptorState,
} from "../../atoms/atoms";
import { translate } from "../../../../util/util";
import FacetedSearch from "../FacetedSearch/FacetedSearch";
import MapSearchResultList from "./components/MapSearchResultList/MapSearchResultList";
import ToggleFacetsButton from "./components/ToggleFacetsButton/ToggleFacetsButton";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";

import "./MapSearch.scss";

export const MAP_PROJECTION = "EPSG:3857";

// The general Map Search component for the main view
export const MapSearch = () => {
  // state

  const [isFacetedSearchOpen, setIsFacetedSearchOpen] = useState(false);
  const isSearchLoading = useRecoilValue(searchIsLoadingState);
  const { mapCount } = useRecoilValue(searchResultDescriptorState);

  ////
  // Handler section
  ////

  // toggle the faceted Search open
  const handleToggleFacetedSearch = () => {
    setIsFacetedSearchOpen((prevState) => !prevState);
  };

  return (
    <div
      className={clsx(
        "mapsearch-container",
        isFacetedSearchOpen && "facetedsearch-open"
      )}
    >
      <div className="panel panel-default searchTablePanel">
        <div className="panel-heading">
          <div className="content">
            <div>
              {mapCount === 0
                ? translate("mapsearch-found-no-maps")
                : `${mapCount} ${translate("mapsearch-found-maps")}`}
            </div>
            {isSearchLoading && (
              <div className="loading-spinner">
                <LoadingSpinner />
              </div>
            )}
            <ToggleFacetsButton
              onClick={handleToggleFacetedSearch}
              isOpen={isFacetedSearchOpen}
            />
          </div>
          <div className="facet-container">
            <FacetedSearch georeferenceMode={false} />
          </div>
        </div>
        <div className="panel-body">
          <MapSearchResultList />
        </div>
      </div>
    </div>
  );
};

export default MapSearch;