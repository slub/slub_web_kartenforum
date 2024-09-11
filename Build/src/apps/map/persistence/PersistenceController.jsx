/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import { View } from "ol";
import React, { useEffect, useState } from "react";
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
  adjustMapView,
  areAllUndefined,
  deSerializeOperationalLayer,
  fitMapToFeatures,
  joinArrayPathParameters,
  updateCameraFromMapview,
  useLocalStorage,
  wrapMapFeatures,
} from "./util";
import { notificationState } from "../../../atoms/atoms";
import { parseMapView, parseViewMode } from "./urlParser";
import { translate } from "../../../util/util";
import LocalStorageWriter from "./LocalStorageWriter.jsx";
import { fetchFeatureForMapId } from "./api.js";
import { PERSISTENCE_CUSTOM_BASEMAP_KEYS } from "../components/BasemapSelectorControl/BasemapSelectorDialog.jsx";
import { validatePersistenceObject } from "./validation.js";

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
  const [restoreSource, setRestoreSource] = useState(undefined);
  const setActiveBasemapId = useSetRecoilState(activeBasemapIdState);
  const setFacets = useSetRecoilState(facetState);
  const setNotification = useSetRecoilState(notificationState);
  const setSelectedFeatures = useSetRecoilState(selectedFeaturesState);
  const setTimeRange = useSetRecoilState(timeRangeState);
  const setTimeExtent = useSetRecoilState(timeExtentState);

  const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

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

  const [customLayer, setCustomLayer] = useLocalStorage(
    PERSISTENCE_CUSTOM_BASEMAP_KEYS,
    []
  );

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

  // determine restore source
  useEffect(() => {
    // parse settings from url params
    const { b, v, oid, map_id, map_view_id, ...rest } = parse(location.search, {
      arrayFormat: "comma",
      parseNumbers: true,
    });

    // there are three scenarios:
    // 1. map_view_id defined => restore from map_view_id
    // 2. other url parameters defined => restore from url parameters
    // 3. No url parameters defined => try to restore from local storage

    if (map_view_id !== undefined) {
      const mapViewEndpoint = "/map_view/";
      const path = `${mapViewEndpoint}${map_view_id}`;
      georeferenceApi.get(path).then((resp) => {
        const { map_view_json } = resp.data;
        const { customBasemaps, ...rest } = JSON.parse(map_view_json);

        // restore potentially saved customBasemaps
        if (customBasemaps !== undefined && customBasemaps.length > 0) {
          setCustomLayer(
            customBasemaps.concat(customLayer).filter((item, pos, self) => {
              return self.findIndex((i) => i.id === item.id) === pos;
            })
          );
        }

        setRestoreSource(rest);
      });
    } else {
      const urlViewMode = parseViewMode(v);

      const urlPersistenceObject = {
        activeBasemapId: b,
        is3dEnabled: urlViewMode,
        mapView: parseMapView(rest, urlViewMode),
        oid: joinArrayPathParameters(oid, map_id),
      };

      // restore from url if at least one property is set via url
      const restoreFromUrl =
        !areAllUndefined(urlPersistenceObject) || oid !== undefined;

      // read persistence object either from local storage or from the url
      setRestoreSource(
        restoreFromUrl ? urlPersistenceObject : persistenceObject
      );
    }
  }, []);

  // first restore settings from persistence object, afterwards restore the operational layers
  useEffect(() => {
    if (restoreSource !== undefined) {
      const {
        activeBasemapId: persistedBasemap,
        is3dEnabled: persistenceIs3dEnabled,
        oid,
        operationalLayers,
        mapView = {},
      } = restoreSource;

      // do not restore from the source if it is determined to be invalid
      if (!validatePersistenceObject(restoreSource)) {
        handleNotification(
          translate("persistencecontroller-error-persistence-object")
        );
        return;
      }

      try {
        // restore basemap
        if (persistedBasemap !== undefined) {
          setActiveBasemapId(persistedBasemap);
        }

        // restore mapview if available
        if (map !== undefined && olcsMap !== undefined) {
          const adjustedMapView = adjustMapView(mapView);

          // update camera in case the 3d view mode will be activated, else update ol map view
          if (persistenceIs3dEnabled) {
            const camera = olcsMap.getCesiumScene().camera;

            // enable 3d
            olcsMap.setEnabled(true);

            updateCameraFromMapview(camera, adjustedMapView);
          } else {
            const mapViewSettings = Object.assign(
              {},
              SettingsProvider.getDefaultMapView(),
              adjustedMapView
            );

            map.setView(new View(mapViewSettings));
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
    }
  }, [map, olcsMap, restoreSource]);

  // restore searchOptions from persistence object
  useEffect(() => {
    if (restoreSource !== undefined) {
      const { searchOptions } = restoreSource;
      if (searchOptions !== undefined) {
        const {
          facets: persistedFacets,
          timeExtent,
          timeRange,
        } = searchOptions;

        if (persistedFacets !== undefined) {
          setFacets(persistedFacets);
        }

        if (timeRange !== undefined) {
          setTimeRange(timeRange);
        }

        if (timeExtent !== undefined) {
          setTimeExtent(timeExtent);
        }
      }
    }
  }, [restoreSource]);

  return <LocalStorageWriter />;
};
