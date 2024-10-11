/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import clsx from "clsx";

import {
  defaultFacetState,
  facetState,
  searchIsLoadingState,
  mapCountState,
} from "@map/atoms";
import { translate } from "@util/util";
import FacetedSearch from "@map/components/FacetedSearch";
import MapSearchResultList from "./components/MapSearchResultList/MapSearchResultList";
import ToggleFacetsButton from "./components/ToggleFacetsButton/ToggleFacetsButton";
import LoadingSpinner from "@components/LoadingSpinner/LoadingSpinner";
import SvgIcons from "@components/SvgIcons/SvgIcons.jsx";

import "./MapSearch.scss";
import PaginatingDataController from "@map/components/PaginatingDataController/PaginatingDataController.jsx";
import PropTypes from "prop-types";

export const MAP_PROJECTION = "EPSG:3857";

// The general Map Search component for the main view
export const MapSearch = ({
  customQuery,
  MapSearchListItemComponent,
  mosaicMode,
}) => {
  // state
  const [facets, setFacets] = useRecoilState(facetState);
  const [isFacetedSearchOpen, setIsFacetedSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isSearchLoading = useRecoilValue(searchIsLoadingState);
  const mapCount = useRecoilValue(mapCountState);

  ////
  // Handler section
  ////

  // toggle the faceted Search open
  const handleToggleFacetedSearch = () => {
    setIsFacetedSearchOpen((prevState) => !prevState);
  };

  // Remove all facets 'n filters
  const handleRemoveFacets = () => {
    setFacets(defaultFacetState);
  };

  useEffect(() => {
    setIsLoading(isSearchLoading);
  }, [isSearchLoading]);

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
            {facets.facets.length > 0 && (
              <button className="remove-filter" onClick={handleRemoveFacets}>
                <SvgIcons name="icon-filter" />
              </button>
            )}
            {isLoading && (
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
            <FacetedSearch georeferenceMode={false} mosaicMode={mosaicMode} />
          </div>
        </div>
        <div className="panel-body">
          <MapSearchResultList
            customQuery={customQuery}
            DataProvider={PaginatingDataController}
            ListItemComponent={MapSearchListItemComponent}
          />
        </div>
      </div>
    </div>
  );
};

MapSearch.propTypes = {
  customQuery: PropTypes.array,
  MapSearchListItemComponent: PropTypes.elementType,
  mosaicMode: PropTypes.bool,
};

export default MapSearch;
