/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import { View } from "ol";
import React, { useCallback, useEffect } from "react";
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
  serializeMapView,
  serializeOperationalLayer,
  updateCameraFromMapview,
  useLocalStorage,
  useOnPageLeave,
} from "./util";
import { notificationState } from "../../../atoms/atoms";
import { parseMapView, parseViewMode } from "./urlParser";
import { MIN_3D_ZOOM } from "../../../components/ToggleViewmode/ToggleViewmode";
import { LAYER_TYPES } from "../components/CustomLayers/LayerTypes";
import { translate } from "../../../util/util";

const PERSISTENCE_OBJECT_KEY = "vk_persistence_container";

export const PersistenceController = () => {
  const [mapIs3dEnabled, setMapIs3dEnabled] = useRecoilState(map3dState);
  const [facets, setFacets] = useRecoilState(facetState);
  const [timeExtent, setTimeExtent] = useRecoilState(timeExtentState);
  const timeRange = useRecoilValue(timeRangeState);
  const map = useRecoilValue(mapState);
  const olcsMap = useRecoilValue(olcsMapState);
  const setNotification = useSetRecoilState(notificationState);
  const [activeBasemapId, setActiveBasemapId] =
    useRecoilState(activeBasemapIdState);

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
  const [persistenceObject, setPersistenceObject] = useLocalStorage(
    PERSISTENCE_OBJECT_KEY,
    {
      operationalLayers: [],
      is3dEnabled: false,
    }
  );

  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );

  // parse settings from url params
  const { b, v, oid, ...rest } = parse(location.search, {
    arrayFormat: "comma",
    parseNumbers: true,
  });

  const urlViewMode = parseViewMode(v);

  const restoreSource = {
    activeBasemapId: b,
    is3dEnabled: urlViewMode,
    mapView: parseMapView(rest, urlViewMode),
  };

  const restoreFromUrl = !areAllUndefined(restoreSource) || oid !== undefined;

  const handleNotification = (text, type = "danger") => {
    setNotification({
      id: "persistence-controller",
      type,
      text,
    });
  };

  // url params overwrite local storage
  const {
    activeBasemapId: persistedBasemap,
    operationalLayers,
    is3dEnabled: persistenceIs3dEnabled,
    mapView = {},
    searchOptions,
  } = restoreFromUrl ? restoreSource : persistenceObject;

  // restore other map/layer related settings from local storage
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
              setSelectedFeatures(
                features.map((feature) => ({
                  feature,
                  displayedInMap: false,
                  type: LAYER_TYPES.HISTORIC_MAP,
                }))
              );
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

  useEffect(() => {
    if (searchOptions !== undefined) {
      const {
        timeExtent: [persistedBegin, persistedEnd],
      } = searchOptions;

      const newTimeExtent = [
        Math.max(persistedBegin, timeRange[0]),
        Math.min(persistedEnd, timeRange[1]),
      ];

      setTimeExtent(newTimeExtent);
    }
  }, [timeRange]);

  // Persist current state to localStorage
  const writeStateToLocalStorage = useCallback(() => {
    // Persist basic feature settings
    const newPersistenceObject = {
      activeBasemapId,
      is3dEnabled: mapIs3dEnabled,
      operationalLayers: selectedFeatures.map((selectedFeature) => {
        const layers = map
          .getLayers()
          .getArray()
          .filter((layer) => layer.getId !== undefined);
        const mapLayer = layers.find(
          (layer) => layer.getId() === selectedFeature.feature.getId()
        );

        return serializeOperationalLayer(selectedFeature, mapLayer);
      }),
      searchOptions: {
        facets,
        timeExtent,
      },
    };

    if (map !== undefined) {
      // Persist map view
      const camera = olcsMap.getCesiumScene().camera;

      newPersistenceObject.mapView = serializeMapView(
        camera,
        map,
        mapIs3dEnabled
      );
    }

    // write changes to localStorage
    setPersistenceObject(newPersistenceObject);
  }, [
    activeBasemapId,
    map,
    mapIs3dEnabled,
    olcsMap,
    facets,
    selectedFeatures,
    timeExtent,
  ]);

  // Write state on page leave to storage
  useOnPageLeave(writeStateToLocalStorage);

  return <></>;
};
