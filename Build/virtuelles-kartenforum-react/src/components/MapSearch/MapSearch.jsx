/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef, useState } from "react";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
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

// approximated height of a view item
const VIEW_ITEM_HEIGHT = 120;

export const MapSearch = (props) => {
  const settings = SettingsProvider.getSettings();
  const is3dEnabled = useRecoilValue(map3dState);
  const [blockUpdate, setBlockUpdate] = useState(false);
  const timeExtent = useRecoilValue(timeExtentState);
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

  const setSelectedFeatures = useSetRecoilState(selectedFeaturesState);

  const handleElementClick = (feature) => {
    setSelectedFeatures((selectedFeatures) => [
      ...selectedFeatures,
      { feature },
    ]);
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

  // var createSearchCol = function (type) {
  //   var col = goog.dom.createDom("div", { class: "inner-col " + type });
  //   var content = goog.dom.createDom("div", {
  //     "data-type": type,
  //     class: "sort-element " + type,
  //     innerHTML:
  //         vk2.utils.getMsg("mapsearch-" + type) +
  //         ' <span class="caret caret-reversed"></span>',
  //   });
  //   goog.dom.appendChild(col, content);
  //   return col;
  // };

  useEffect(() => {
    if (map !== undefined) {
      const featureSource = new ServerPagination({
        is3d: is3dEnabled,
        elasticsearch_srs: settings["ELASTICSEARCH_SRS"],
        elasticsearch_node: settings["ELASTICSEARCH_NODE"],
        projection: "EPSG:900913",
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

  // goog.events.listen(
  //   this.featureSource_,
  //   "refresh",
  //   goog.bind(this.refresh_, this)
  // );
  // goog.events.listen(
  //   this.featureSource_,
  //   "paginate",
  //   goog.bind(this.update_, this)
  // );

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

// /**
//  * @enum {string}
//  */
// vk2.module.MapSearchModuleEventType = {
//   ADDMAP: "addmap",
//   CLICK_RECORD: "click-record",
// };
//
// /**
//  * @param {Element|string} parentEl
//  * @param {ol.Map} map
//  * @constructor
//  * @extends {goog.events.EventTarget}
//  */
// vk2.module.MapSearchModule = function (parentEl, map) {
//   // append different events
//   this.appendSortBehavior_(this.parentEl_);
//   this.appendScrollBehavior_();
//   this.appendClickBehavior_();
//   this.appendFacetBehavior_();
//
//   goog.base(this);
// };
// goog.inherits(vk2.module.MapSearchModule, goog.events.EventTarget);

// /**
//  * @private
//  */

//
// /**
//  * @private
//  */

//
// /**
//  * Function appends the facet behavior
//  * @private
//  */
// vk2.module.MapSearchModule.prototype.appendFacetBehavior_ = function () {
//   goog.events.listen(
//     this.facetSearch_,
//     vk2.tool.FacetedSearchEventType.FACET_CHANGE,
//     function (event) {
//       if (goog.DEBUG) {
//         console.log(event.target);
//       }
//
//       this.featureSource_.setFacets(event.target);
//     },
//     undefined,
//     this
//   );
// };
//
// /**
//  * @param {Array.<ol.Feature>} features
//  * @private
//  */
// vk2.module.MapSearchModule.prototype.appendFeaturesToList_ = function (
//   features
// ) {
//   for (var i = 0; i < features.length; i++) {
//     var element = vk2.factory.MapSearchFactory.getMapSearchRecord(features[i]);
//     goog.dom.appendChild(this.searchListEl_, element);
//     if (goog.isDef(this.featureOverlay_))
//       vk2.factory.MapSearchFactory.addHoverToMapSearchRecord(
//         element,
//         features[i],
//         this.featureOverlay_
//       );
//   }
// };
//
// /**
//  * @return {ol.Collection}
//  */
// vk2.module.MapSearchModule.prototype.getFeatures = function () {
//   return this.featureSource_.getFeatures();
// };
//
// /**
//  * @return {vk2.source.ServerPagination}
//  */
// vk2.module.MapSearchModule.prototype.getFeatureSource = function () {
//   return this.featureSource_;
// };
//
// /**
//  * @private
//  */
// vk2.module.MapSearchModule.prototype.refreshMapSearchList_ = function () {
//   this.searchListEl_.innerHTML = "";
//   //this.appendFeaturesToList_();
// };
//
// /**
//  * @param {string} type
//  * @private
//  */
// vk2.module.MapSearchModule.prototype.sort_ = function (type) {
//   // get the sort control element and the sortOrder
//   var sortControlEl = goog.dom.getElementByClass("sort-element " + type);
//   var sortOrder = goog.dom.classlist.contains(sortControlEl, "ascending")
//     ? "descending"
//     : "ascending";
//
//   // remove old sort classes
//   var sortElements = goog.dom.getElementsByClass("sort-element");
//   for (var i = 0; i < sortElements.length; i++) {
//     goog.dom.classlist.remove(sortElements[i], "descending");
//     goog.dom.classlist.remove(sortElements[i], "ascending");
//   }
//
//   // sort list
//   goog.dom.classlist.add(sortControlEl, sortOrder);
//   this.featureSource_.setSortAttribute(type);
//   this.featureSource_.setSortOrder(sortOrder);
//   this.featureSource_.refresh();
// };
//
// /**
//  * @private
//  * @param {Object} event
//  */

//
// /**
//  * @private
//  * @param {Object} event
//  */

//
// /**
//  * @param {number} count_features
//  * @private
//  */
// vk2.module.MapSearchModule.prototype.updateHeading_ = function (
//   count_features
// ) {
//   if (count_features > 0) {
//     this.headingContentEl_.innerHTML =
//       count_features + " " + vk2.utils.getMsg("mapsearch-found-maps");
//     return undefined;
//   }
//   this.headingContentEl_.innerHTML = vk2.utils.getMsg(
//     "mapsearch-found-no-maps"
//   );
// };
