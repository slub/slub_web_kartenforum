/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef } from "react";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { useRecoilValue } from "recoil";
import { map3dState } from "../../atoms/atoms";
import { MAP_SEARCH_HOVER_FEATURE } from "../../config/styles";
import { mapState } from "../../atoms/atoms";
import ServerPagination from "../Source/ServerPaginationSource";
import { SettingsProvider } from "../../index";
import { addOpenCloseBehavior, isDefined, translate } from "../../util/util";
import FacetedSearch from "../FacetedSearch/FacetedSearch";

const SEARCH_COLS = ["time", "title", "georeference"];

export const MapSearch = (props) => {
  const settings = SettingsProvider.getSettings();
  const is3dEnabled = useRecoilValue(map3dState);
  const map = useRecoilValue(mapState);
  const featureSourceRef = useRef();
  const featureOverlayRef = useRef();
  const openButtonRef = useRef();
  const containerRef = useRef();
  const facetContainerRef = useRef();

  const renderSearchCol = function (type) {
    return (
      <div className={`inner-col${type}`}>
        <div className={`sort-element${type}`} datatype={type}>
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
      featureOverlay_.set("altitudeMode", "clampToGround");
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
            <div />
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
              className="mapsearch-contentlist"
              id="mapsearch-contentlist"
            ></ul>
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
// vk2.module.MapSearchModule.prototype.appendClickBehavior_ = function () {
//   if (goog.isDef(this.searchListEl_)) {
//     goog.events.listen(
//       this.searchListEl_,
//       goog.events.EventType.CLICK,
//       function (event) {
//         event.preventDefault();
//
//         // get proper feature to the event
//         var origin_target = vk2.utils.getClosestParentElementForClass(
//           event.getBrowserEvent().target,
//           "mapsearch-record"
//         );
//
//         // get the corresponding feature to this event
//         var feature;
//         var features = this.featureSource_.getFeatures();
//         features.forEach(function (ft) {
//           if (ft.get("id") == origin_target.id) feature = ft;
//         });
//         this.dispatchEvent(
//           new goog.events.Event(
//             vk2.module.MapSearchModuleEventType.CLICK_RECORD,
//             { feature: feature }
//           )
//         );
//       },
//       undefined,
//       this
//     );
//   }
// };
//
// /**
//  * @param {Element} parentEl
//  * @private
//  */
// vk2.module.MapSearchModule.prototype.appendSortBehavior_ = function (parentEl) {
//   var sortElements = goog.dom.getElementsByClass("sort-element", parentEl);
//   for (var i = 0; i < sortElements.length; i++) {
//     goog.events.listen(
//       sortElements[i],
//       goog.events.EventType.CLICK,
//       function (event) {
//         var sort_type = event.target.getAttribute("data-type");
//         this.sort_(sort_type);
//       },
//       undefined,
//       this
//     );
//   }
// };
//
// /**
//  * @private
//  */
// vk2.module.MapSearchModule.prototype.appendScrollBehavior_ = function () {
//   // this variable blocks the append behavior if another appendFeatureToListRequest is
//   // right now in the pipe
//   var scroll_event_blocked = false;
//   if (goog.isDef(this.searchListEl_)) {
//     goog.events.listen(
//       this.searchListEl_,
//       goog.events.EventType.SCROLL,
//       function (event) {
//         // looks if another scroll event is already in the pipe
//         if (!scroll_event_blocked) {
//           scroll_event_blocked = true;
//
//           var scrollEl = event.currentTarget;
//           // check if scrolled to end of list and if yes triggger append event
//           if (
//             scrollEl.offsetHeight + scrollEl.scrollTop >=
//             scrollEl.scrollHeight
//           ) {
//             // check if there are still features to append
//             if (!this.featureSource_.isComplete())
//               this.featureSource_.paginate_();
//           }
//
//           scroll_event_blocked = false;
//         } else {
//           if (goog.DEBUG) console.log("Scroll event fired but not used");
//         }
//       },
//       undefined,
//       this
//     );
//   }
// };
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
// vk2.module.MapSearchModule.prototype.refresh_ = function (event) {
//   if (goog.DEBUG) {
//     console.log("Refresh MapSearchModule.");
//   }
//
//   this.updateHeading_(event.target["totalFeatureCount"]);
//   this.searchListEl_.innerHTML = "";
//   this.appendFeaturesToList_(event.target["features"]);
// };
//
// /**
//  * @private
//  * @param {Object} event
//  */
// vk2.module.MapSearchModule.prototype.update_ = function (event) {
//   if (goog.DEBUG) {
//     console.log("Refresh MapSearchModule.");
//   }
//
//   this.updateHeading_(event.target.totalFeatureCount);
//   this.appendFeaturesToList_(event.target["features"]);
// };
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
