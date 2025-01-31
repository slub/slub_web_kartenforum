/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import clsx from "clsx";

import MapSearchResultList from "@map/components/MapSearch/components/MapSearchResultList/MapSearchResultList";
import { mapCountState } from "@map/atoms";
import ToggleFacetsButton from "@map/components/MapSearch/components/ToggleFacetsButton/ToggleFacetsButton";
import ToggleSearchButton from "../ToggleSearchButton/ToggleSearchButton";
import { ToggleResultListButton } from "../ToggleResultListButton/ToggleResultListButton";
import PaginatingDataController from "@map/components/PaginatingDataController/PaginatingDataController";
import TimeSliderSearch from "@map/components/TimeSliderSearch";
import SettingsProvider from "@settings-provider";
import { translate } from "@util/util";
import PlacenameSearchMap from "@components/PlacenameSearch/PlacenameSearchMap";
import "./SearchHeader.scss";

export const SearchHeader = ({
  enableReopenResultList = true,
  onToggleFacets,
  showFacets,
}) => {
  const mapCount = useRecoilValue(mapCountState);
  const [showSearchResultList, setShowSearchResultList] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [wasResultListOpen, setWasResultListOpen] = useState(false);

  const handleToggleSearchResultListButton = () => {
    setShowSearchResultList((oldState) => !oldState);
  };

  const handleToggleSearchButtonClick = () => {
    setShowSearch((oldState) => !oldState);
  };

  // Autohide the search result list if there are no results and reopen it if there are some results
  useEffect(() => {
    if (mapCount === 0 && showSearchResultList) {
      setShowSearchResultList(false);
      setWasResultListOpen(true);
    } else if (enableReopenResultList && mapCount > 0 && wasResultListOpen) {
      setShowSearchResultList(true);
      setWasResultListOpen(false);
    }
  }, [mapCount]);

  const transitionClass = showSearchResultList
    ? "show-search-result-list"
    : "hide-search-result-list";

  return (
    <Fragment>
      <div className="vkf-search-header">
        <div className="top-container">
          <div className="result-summary">
            {mapCount === 0
              ? translate("mapsearch-found-no-maps")
              : `${mapCount} ${translate("mapsearch-found-maps")}`}
          </div>
          <div className="controls-container">
            <ToggleFacetsButton onClick={onToggleFacets} isOpen={showFacets} />
            <ToggleSearchButton
              onClick={handleToggleSearchButtonClick}
              isOpen={showSearch}
            />
          </div>
        </div>
        {showSearch && (
          <div className="bottom-container">
            <PlacenameSearchMap
              searchUrl={SettingsProvider.getNominatimUrl()}
            />
            <TimeSliderSearch />
          </div>
        )}
      </div>
      <ToggleResultListButton
        disabled={mapCount === 0}
        onClick={handleToggleSearchResultListButton}
        isOpen={showSearchResultList}
      />
      <div className={clsx("vkf-search-result-container", transitionClass)}>
        <MapSearchResultList
          enableOverlayLayer={false}
          DataProvider={PaginatingDataController}
          direction="horizontal"
          itemSize={170}
          renderHeader={false}
        />
      </div>
    </Fragment>
  );
};

SearchHeader.propTypes = {
  enableReopenResultList: PropTypes.bool,
  onToggleFacets: PropTypes.func,
  showFacets: PropTypes.bool,
};

export default SearchHeader;
