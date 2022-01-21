/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import { View } from "ol";
import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { parse } from "query-string";

import {
  activeBasemapIdState,
  facetState,
  map3dState,
  mapState,
  olcsMapState,
  selectedFeaturesState,
  timeExtentState,
  timeRangeState,
} from "../atoms/atoms";

import SettingsProvider from "../../../SettingsProvider";
import {
  areAllUndefined,
  deSerializeOperationalLayer,
  fetchFeatureForMapId,
  fitMapToFeatures,
  updateCameraFromMapview,
  useLocalStorage,
  wrapMapFeatures,
} from "./util";
import { notificationState } from "../../../atoms/atoms";
import { parseMapView, parseViewMode } from "./urlParser";
import { MIN_3D_ZOOM } from "../../../components/ToggleViewmode/ToggleViewmode";
import { translate } from "../../../util/util";
import LocalStorageWriter from "./LocalStorageWriter.jsx";

export const PERSISTENCE_OBJECT_KEY = "vk_persistence_container";

/**
 * Handles the persistence aspects of the application
 *
 * There are 3 responsibilities:
 *  1. Write the application state to the local storage if the page is left.
 *  2. Read the application state from local storage if it is not overwritten by the url.
 *  3. Read the application state from the url
 *    3.a Focus the map on the features if there is no mapview defined in the url
 * @return {JSX.Element}
 * @constructor
 */
export const PersistenceController = () => {
  const map = useRecoilValue(mapState);
  const [mapIs3dEnabled, setMapIs3dEnabled] = useRecoilState(map3dState);
  const olcsMap = useRecoilValue(olcsMapState);
  const setActiveBasemapId = useSetRecoilState(activeBasemapIdState);
  const setFacets = useSetRecoilState(facetState);
  const setNotification = useSetRecoilState(notificationState);
  const setSelectedFeatures = useSetRecoilState(selectedFeaturesState);
  const setTimeRange = useSetRecoilState(timeRangeState);
  const setTimeExtent = useSetRecoilState(timeExtentState);

  /**
   * @type {{
   * activeBasemapId: string,
   * is3dEnabled: boolean,
   * mapView: {center: [number, number], resolution: number, rotation: number, zoom: number } | {altitude: number, center: number[], distance: number, heading: number, position: number[], tilt: number} ,
   * operationalLayers: { coordinates: number[], id: string, properties: Object, isVisible: boolean, opacity: number }[],
   * searchOptions: {
   *     facets: {}[],
   *     timeExtent: number[]
   * }
   * }}
   *
   **/
  const [persistenceObject] = useLocalStorage(PERSISTENCE_OBJECT_KEY, {
    operationalLayers: [],
    is3dEnabled: false,
  });

  ////
  // Handler section
  ////
  const handleNotification = (text, type = "danger") => {
    setNotification({
      id: "persistence-controller",
      type,
      text,
    });
  };

  ////
  // Persistence section
  ////

  // URL related part

  // parse settings from url params
  const { b, v, oid, ...rest } = parse(location.search, {
    arrayFormat: "comma",
    parseNumbers: true,
  });

  const urlViewMode = parseViewMode(v);

  const urlPersistenceObject = {
    activeBasemapId: b,
    is3dEnabled: urlViewMode,
    mapView: parseMapView(rest, urlViewMode),
  };

  // restore from url if at least one property is set via url
  const restoreFromUrl =
    !areAllUndefined(urlPersistenceObject) || oid !== undefined;

  // read persistence object either from local storage or from the url
  const {
    activeBasemapId: persistedBasemap,
    operationalLayers,
    is3dEnabled: persistenceIs3dEnabled,
    mapView = {},
    searchOptions,
  } = restoreFromUrl ? urlPersistenceObject : persistenceObject;

  // first restore settings from persistence object, afterwards restore the operational layers
  useEffect(() => {
    try {
      // restore basemap
      if (persistedBasemap !== undefined) {
        setActiveBasemapId(persistedBasemap);
      }

      // restore search settings
      if (searchOptions !== undefined) {
        const { facets: persistedFacets } = searchOptions;

        setFacets(persistedFacets);
      }

      if (map !== undefined && olcsMap !== undefined) {
        // restore mapview if available

        map.setView(
          new View(
            Object.assign(
              {},
              SettingsProvider.getDefaultMapView(),
              // cap zoom in case of undefined mapView
              persistenceIs3dEnabled
                ? {
                    zoom: MIN_3D_ZOOM + 0.1 * MIN_3D_ZOOM,
                  }
                : mapView
            )
          )
        );

        if (persistenceIs3dEnabled) {
          olcsMap.setEnabled(persistenceIs3dEnabled);
          const camera = olcsMap.getCesiumScene().camera;

          updateCameraFromMapview(camera, mapView);
        }

        // only set the 3d state after the map was initialized in order to handle correct view initalization
        setMapIs3dEnabled(persistenceIs3dEnabled);

        // restore features from localstorage if available and no query param for oid is specified
        if (
          operationalLayers !== undefined &&
          operationalLayers.length > 0 &&
          oid === undefined
        ) {
          try {
            const newOperationalLayers = operationalLayers.map(
              deSerializeOperationalLayer
            );

            setSelectedFeatures(newOperationalLayers);
          } catch (e) {
            console.error(e);
            handleNotification(
              translate("persistencecontroller-error-persistence-object")
            );
          }
        } else if (oid !== undefined) {
          // restore features from oid
          const mapIds = Array.isArray(oid) ? oid : [oid];

          const fetchProcesses = mapIds.map((id) =>
            fetchFeatureForMapId(id, mapIs3dEnabled)
          );

          Promise.all(fetchProcesses)
            .then((features) => {
              setSelectedFeatures(wrapMapFeatures(features));

              // fit view to features if the mapView param is undefined
              if (
                mapView === undefined ||
                Object.entries(mapView).length === 0
              ) {
                fitMapToFeatures(map, features);
              }
            })
            .catch((e) => {
              console.error(e);
              handleNotification(
                translate("persistencecontroller-error-single-map"),
                "warning"
              );
            });
        }
      }
    } catch (e) {
      console.error(e);
      handleNotification(
        translate("persistencecontroller-error-persistence-object")
      );
    }
  }, [map, olcsMap]);

  // restore time extent and range from persistence object
  useEffect(() => {
    if (searchOptions !== undefined) {
      const { timeExtent, timeRange: persistedTimeRange } = searchOptions;

      setTimeRange(persistedTimeRange);
      setTimeExtent(timeExtent);
    }
  }, []);

  return <LocalStorageWriter />;
};
