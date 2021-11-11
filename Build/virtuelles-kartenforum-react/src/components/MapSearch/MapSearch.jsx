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
import { addOpenCloseBehavior, isDefined, translate } from "../../util/util";
import FacetedSearch from "../FacetedSearch/FacetedSearch";
import MapSearchListElement from "./MapSearchListElement";

const SEARCH_COLS = ["time", "title", "georeference"];
const DEFAULT_TYPE = "title";

export const MAP_PROJECTION = "EPSG:900913";

// approximated height of a view item
const VIEW_ITEM_HEIGHT = 120;

const checkIfArrayContainsFeature = (array, feature) => {
  return (
    array.findIndex(
      ({ feature: selFeature }) => selFeature.get("id") === feature.get("id")
    ) !== -1
  );
};

export const MapSearch = (props) => {
  const settings = SettingsProvider.getSettings();
  const is3dEnabled = useRecoilValue(map3dState);
  const [blockUpdate, setBlockUpdate] = useState(false);
  const timeExtent = useRecoilValue(timeExtentState);
  const facets = useRecoilValue(facetState);
  const map = useRecoilValue(mapState);
  const featureSourceRef = useRef();
  const featureOverlayRef = useRef();
  const openButtonRef = useRef();
  const containerRef = useRef();
  const facetContainerRef = useRef();
  const searchListRef = useRef();

  const [{ features, featureCount, id }, setFeatures] = useRecoilState(
    featureState
  );

  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );

  const handleElementClick = (feature) => {
    const containsFeature = checkIfArrayContainsFeature(
      selectedFeatures,
      feature
    );

    // remove feature if it is already contained
    if (containsFeature) {
      // remove from selectedFeaturesList
      setSelectedFeatures((selectedFeatures) =>
        selectedFeatures.filter(
          ({ feature: selFeature }) =>
            selFeature.get("id") !== feature.get("id")
        )
      );

      // remove map layer
      const layers = map
        .getLayers()
        .getArray()
        .filter((lay) => lay.allowUseInLayerManagement);
      const layer = layers.find((layer) => {
        return layer.getFeatureId() === feature.get("id");
      });

      map.removeLayer(layer);
    } else {
      setSelectedFeatures((selectedFeatures) => [
        ...selectedFeatures,
        { feature },
      ]);
    }
  };

  const handleUpdate = (features) => {
    setFeatures(features);
    setBlockUpdate(false);
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

  useEffect(() => {
    if (map !== undefined) {
      const featureSource = new ServerPagination({
        is3d: is3dEnabled,
        elasticsearch_srs: settings["ELASTICSEARCH_SRS"],
        elasticsearch_node: settings["ELASTICSEARCH_NODE"],
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
          const topLayer = event.target.getArray()[
            event.target.getLength() - 1
          ];
          if (
            // @TODO: MIGRATE VK2 LAYER
            // topLayer instanceof vk2.layer.HistoricMap ||
            // topLayer instanceof vk2.layer.HistoricMap3D ||
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
    addOpenCloseBehavior(
      openButtonRef.current,
      facetContainerRef.current,
      containerRef.current,
      "facetedsearch-open",
      translate("facetedsearch-open"),
      translate("facetedsearch-close")
    );
  }, []);

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
    <div className="mapsearch-container" ref={containerRef}>
      <div className="panel panel-default searchTablePanel">
        <div className="panel-heading">
          <div className="content">
            <div>{`${featureCount} ${translate("mapsearch-found-maps")}`}</div>
            <a ref={openButtonRef} title={translate("facetedsearch-open")}>
              o
            </a>
          </div>
          <div className="facet-container" ref={facetContainerRef}>
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
                  selected={checkIfArrayContainsFeature(
                    selectedFeatures,
                    feature
                  )}
                  onClick={handleElementClick}
                  feature={feature}
                  featureOverlay={featureOverlayRef.current}
                  is3d={is3dEnabled}
                  key={feature.get("id")}
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
