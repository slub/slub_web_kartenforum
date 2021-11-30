/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef, useState } from "react";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { useRecoilState, useRecoilValue } from "recoil";
import clsx from "clsx";

import {
  facetState,
  featureState,
  map3dState,
  selectedFeaturesState,
  timeExtentState,
} from "../../atoms/atoms";
import { MAP_SEARCH_HOVER_FEATURE } from "../../config/styles";
import { mapState } from "../../atoms/atoms";
import ServerPagination from "../Source/ServerPaginationSource";
import { SettingsProvider } from "../../index";
import { isDefined, translate } from "../../util/util";
import FacetedSearch from "../FacetedSearch/FacetedSearch";
import MapSearchListElement from "./MapSearchListElement";
import HistoricMap from "../layer/HistoricMapLayer";

import "./MapSearch.scss";

const DEFAULT_TYPE = "title";
export const MAP_PROJECTION = "EPSG:3857";
const SEARCH_COLS = ["time_published", "title"];

// approximated height of a view item
const VIEW_ITEM_HEIGHT = 120;

const checkIfArrayContainsFeature = (array, feature) => {
  return (
    array.findIndex(
      ({ feature: selFeature }) => selFeature.getId() === feature.getId()
    ) !== -1
  );
};

export const MapSearch = () => {
  const settings = SettingsProvider.getSettings();

  // state
  const [blockUpdate, setBlockUpdate] = useState(false);
  const [isFacetedSearchOpen, setIsFacetedSearchOpen] = useState(false);
  const facets = useRecoilValue(facetState);
  const [{ features, featureCount, id }, setFeatures] =
    useRecoilState(featureState);
  const is3dEnabled = useRecoilValue(map3dState);
  const map = useRecoilValue(mapState);
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );
  const timeExtent = useRecoilValue(timeExtentState);

  // refs
  const featureSourceRef = useRef();
  const featureOverlayRef = useRef();
  const searchListRef = useRef();

  const sort = function (type) {
    const featureSource = featureSourceRef.current;
    // get the sort control element and the sortOrder
    const sortControlEl = document.getElementsByClassName(
      "sort-element " + type
    )[0];
    const sortOrder = sortControlEl.classList.contains("ascending")
      ? "descending"
      : "ascending";

    // remove old sort classes
    const sortElements = document.getElementsByClassName("sort-element");
    for (let i = 0; i < sortElements.length; i++) {
      sortElements[i].classList.remove("descending");
      sortElements[i].classList.remove("ascending");
    }

    // sort list
    sortControlEl.classList.add(sortOrder);
    featureSource.setSortAttribute(type);
    featureSource.setSortOrder(sortOrder);
    featureSource.refresh();
  };

  ////
  // Handler section
  ////

  const handleElementClick = (feature) => {
    const containsFeature = checkIfArrayContainsFeature(
      selectedFeatures,
      feature
    );

    console.log(feature);

    // remove feature if it is already contained
    if (containsFeature) {
      // remove from selectedFeaturesList
      setSelectedFeatures((selectedFeatures) =>
        selectedFeatures.filter(
          ({ feature: selFeature }) => selFeature.getId() !== feature.getId()
        )
      );

      // remove map layer
      const layers = map
        .getLayers()
        .getArray()
        .filter((lay) => lay.allowUseInLayerManagement);

      const layer = layers.find((layer) => {
        return layer.getFeatureId() === feature.getId();
      });

      map.removeLayer(layer);
    } else {
      setSelectedFeatures((selectedFeatures) => [
        ...selectedFeatures,
        { feature },
      ]);
    }
  };

  const handleScroll = () => {
    if (
      searchListRef.current === null ||
      featureSourceRef.current === null ||
      blockUpdate
    )
      return;

    const scrollEl = searchListRef.current;
    if (
      scrollEl.offsetHeight + scrollEl.scrollTop >=
      // start fetching when there are onlu 3 items left before hitting end of the list
      scrollEl.scrollHeight - 3 * VIEW_ITEM_HEIGHT
    ) {
      setBlockUpdate(true);
      // check if there are still features to append
      if (!featureSourceRef.current.isComplete())
        featureSourceRef.current.paginate_();
    }
  };

  const handleToggleFacetedSearch = () => {
    setIsFacetedSearchOpen((prevState) => !prevState);
  };

  const handleUpdate = (features) => {
    setFeatures(features);
    setBlockUpdate(false);
  };

  ////
  // Effect section
  ////

  // reset scroll if id of feature set changes
  useEffect(() => {
    const scrollEl = searchListRef.current;
    if (isDefined(scrollEl)) {
      scrollEl.scrollTop = 0;
    }
  }, [id]);

  const renderSearchCol = function (type) {
    return (
      <div className={`inner-col ${type}`}>
        <div
          className={`sort-element ${type} ${
            type === DEFAULT_TYPE ? "ascending" : ""
          }`}
          datatype={type}
          onClick={() => sort(type)}
        >
          {translate(`mapsearch-${type}`)}
          <span className="caret caret-reversed" />
        </div>
      </div>
    );
  };

  // Add feature overlay layer shown on hover
  useEffect(() => {
    if (map !== undefined) {
      const featureSource = new ServerPagination({
        is3d: is3dEnabled,
        elasticsearch_node: SettingsProvider.getSettings().API_SEARCH,
        elasticsearch_srs: "EPSG:4326",
        projection: MAP_PROJECTION,
        map: map,
        updateCallback: handleUpdate,
      });

      featureSourceRef.current = featureSource;

      const featureOverlay = new VectorLayer({
        source: new VectorSource(),
        style: function (feature, resolution) {
          return [MAP_SEARCH_HOVER_FEATURE];
        },
      });

      featureOverlayRef.current = featureOverlay;

      map.addLayer(featureOverlay);

      // hold the overlay layer on top of the historic map layers
      map.getLayers().on(
        "add",
        (event) => {
          const topLayer =
            event.target.getArray()[event.target.getLength() - 1];
          if (
            topLayer instanceof HistoricMap ||
            topLayer.get("type") == "click"
          ) {
            map.removeLayer(featureOverlay);
            map.addLayer(featureOverlay);
          }
        },
        this
      );
    }
  }, [map]);

  // Update featureOverlay on change of 3d state
  useEffect(() => {
    if (isDefined(featureSourceRef.current)) {
      featureSourceRef.current.update3dState(is3dEnabled);
    }

    if (is3dEnabled) {
      // in case 3d mode is active add altitude value to coordinate
      featureOverlayRef.current.set("altitudeMode", "clampToGround");
    }
  }, [is3dEnabled]);

  useEffect(() => {
    if (isDefined(featureSourceRef.current)) {
      featureSourceRef.current.setTimeFilter(timeExtent[0], timeExtent[1]);
      featureSourceRef.current.refresh();
    }
  }, [featureSourceRef, timeExtent]);

  useEffect(() => {
    if (isDefined(featureSourceRef.current)) {
      featureSourceRef.current.setFacets(facets);
    }
  }, [featureSourceRef, facets]);

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
            <div>{`${featureCount} ${translate("mapsearch-found-maps")}`}</div>
            <button
              onClick={handleToggleFacetedSearch}
              title={translate(
                `facetedsearch-${isFacetedSearchOpen ? "close" : "open"}`
              )}
            />
          </div>
          <div className="facet-container">
            <FacetedSearch georeferenceMode={false} />
          </div>
        </div>
        <div className="panel-body">
          <div className="mapsearch-list">
            <div className="list-header">
              {SEARCH_COLS.map(renderSearchCol)}
            </div>
            <ul
              onScroll={handleScroll}
              className="mapsearch-contentlist"
              id="mapsearch-contentlist"
              ref={searchListRef}
            >
              {features.map((feature) => (
                <MapSearchListElement
                  feature={feature}
                  featureOverlay={featureOverlayRef.current}
                  is3d={is3dEnabled}
                  key={feature.getId()}
                  onClick={handleElementClick}
                  selected={checkIfArrayContainsFeature(
                    selectedFeatures,
                    feature
                  )}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSearch;
