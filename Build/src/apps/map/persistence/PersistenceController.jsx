/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { parse } from "query-string";

import {
  activeBasemapIdState,
  facetState,
  mapState,
  selectedLayersState,
  timeExtentState,
  timeRangeState,
} from "@map/atoms";

import SettingsProvider from "@settings-provider";
import {
  areAllUndefined,
  fitMapToFeatures,
  joinArrayPathParameters,
  useLocalStorage,
} from "./util";
import { notificationState } from "@atoms";
import { parseCameraOptions, parseViewMode } from "./urlParser";
import { translate } from "@util/util";
import LocalStorageWriter from "./LocalStorageWriter.jsx";
import { fetchLayerForMapId } from "./api.js";
import { PERSISTENCE_CUSTOM_BASEMAP_KEYS } from "@map/components/BasemapSelectorControl/BasemapSelectorDialog.jsx";
import { validatePersistenceObject } from "./validation.js";
import {
  convertLegacyMapViewToCameraOptions,
  isLegacyMapView,
} from "./backwardsCompatibility.js";
import { LAYER_TYPES, METADATA } from "@map/components/CustomLayers";
import { fetchWmsTmsSettings } from "@map/components/CustomLayers/HistoricMapLayer/fetchWmsTmsSettings";
import { getVectorMap } from "@map/components/GeoJson/util/apiVectorMaps";
import { loadLayer } from "@map/persistence/loadLayer";

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
  const [restoreSource, setRestoreSource] = useState(undefined);
  const setActiveBasemapId = useSetRecoilState(activeBasemapIdState);
  const setFacets = useSetRecoilState(facetState);
  const setNotification = useSetRecoilState(notificationState);
  const setSelectedLayers = useSetRecoilState(selectedLayersState);
  const setTimeRange = useSetRecoilState(timeRangeState);
  const setTimeExtent = useSetRecoilState(timeExtentState);

  const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

  /**
   * @type {{
   * activeBasemapId: string,
   * is3dEnabled: boolean,
   * cameraOptions: {center: [number, number], resolution: number, rotation: number, zoom: number } | {altitude: number, center: number[], distance: number, heading: number, position: number[], tilt: number} ,
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

        if (rest.mapView && isLegacyMapView(rest.mapView)) {
          rest.mapView = convertLegacyMapViewToCameraOptions(rest.mapView);
        }

        setRestoreSource(rest);
      });
    } else {
      const urlViewMode = parseViewMode(v);

      const urlPersistenceObject = {
        activeBasemapId: b,
        is3dEnabled: urlViewMode,
        cameraOptions: parseCameraOptions(rest),
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
        cameraOptions = {},
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
        if (map !== undefined) {
          const cameraSettings = Object.assign(
            {},
            SettingsProvider.getDefaultMapView(),
            cameraOptions
          );

          map.jumpTo(cameraSettings);

          // if we are restoring a legacy 3d map view, we shift the center a little
          // to make the map view resemble the old one closer (the old position stored was the camera position not the
          // center of the map)
          // @TODO: Improve quality of restored map views => 3d legacy map views are still not close to the old map view
          if (cameraSettings.legacy3dMapView) {
            const canvas = map.getCanvas();
            const height = canvas.height;
            const width = canvas.width;
            const newCenter = map.unproject([width / 2, height * 0.3]);
            map.setCenter(newCenter);

            handleNotification(
              translate("persistencecontroller-deprecated-3d-map-view"),
              "warning"
            );
          }

          if (persistenceIs3dEnabled) {
            map.enableTerrain();
          }

          // restore features from localstorage if available and no query param for oid is specified
          if (
            operationalLayers !== undefined &&
            operationalLayers.length > 0 &&
            oid === undefined
          ) {
            try {
              const layerLoaders = [];

              for (const ol of operationalLayers) {
                if (ol.id !== undefined) {
                  const layerLoadPromise = loadLayer(ol);
                  layerLoaders.push(layerLoadPromise);
                }
              }

              Promise.all(layerLoaders)
                .then((results) => {
                  for (const { layer, settings } of results) {
                    layer.addLayerToMap(map, settings);
                  }

                  const layers = results.map(({ layer }) => layer);
                  setSelectedLayers(layers);
                })
                .catch((e) => {
                  throw new Error(e);
                });
            } catch (e) {
              console.error(e);
              handleNotification(
                translate("persistencecontroller-error-persistence-object")
              );
            }
          } else if (oid !== undefined) {
            // restore features from oid
            const mapIds = Array.isArray(oid) ? oid : [oid];

            const fetchProcesses = mapIds.map((id) => fetchLayerForMapId(id));

            Promise.all(fetchProcesses)
              .then((layers) => {
                Promise.all(
                  layers.map((layer) => {
                    if (layer.getType() === LAYER_TYPES.GEOJSON) {
                      return getVectorMap(
                        layer.getMetadata(METADATA.vectorMapId)
                      ).then((vectorMap) => {
                        layer.updateMetadata(
                          METADATA.userRole,
                          vectorMap[METADATA.userRole]
                        );
                        layer.updateMetadata(
                          METADATA.version,
                          vectorMap[METADATA.version]
                        );

                        layer.setGeoJson(vectorMap.geojson);
                        return { layer };
                      });
                    }

                    return new Promise((resolve) =>
                      fetchWmsTmsSettings(layer).then((sourceSettings) =>
                        resolve({ layer, sourceSettings })
                      )
                    );
                  })
                ).then((results) => {
                  for (const { layer, sourceSettings } of results) {
                    layer.addLayerToMap(map, { sourceSettings });
                  }
                  setSelectedLayers(layers);
                });

                // fit view to features if the mapView param is undefined
                if (
                  cameraOptions === undefined ||
                  Object.entries(cameraOptions).length === 0
                ) {
                  fitMapToFeatures(map, layers);
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
  }, [map, restoreSource]);

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
