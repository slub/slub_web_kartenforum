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
import { isDefined } from "../../../util/util";
import SettingsProvider from "../../../SettingsProvider";
import {
  deSerializeOperationalLayer,
  serializeOperationalLayer,
  useLocalStorage,
  useOnPageLeave,
} from "./util";
import { queryDocument } from "../../../util/apiEs";
import { readFeature } from "../../../util/parser";
import { notificationState } from "../../../atoms/atoms";

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

  const {
    activeBasemapId: persistedBasemap,
    operationalLayers,
    is3dEnabled: persistenceIs3dEnabled,
    mapView,
    searchOptions,
  } = persistenceObject;

  // Persist current state to localStorage
  const handlePageLeave = useCallback(() => {
    // Persist basic feature settings
    const newPersistenceObject = {
      activeBasemapId,
      is3dEnabled: mapIs3dEnabled,
      operationalLayers: selectedFeatures.map((selectedFeature) => {
        const layers = map.getLayers().getArray();
        const mapLayer = layers.find(
          (layer) => layer.id === selectedFeature.feature.id
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
      const view = map.getView();
      const camera = olcsMap.getCesiumScene().camera;

      newPersistenceObject.mapView = mapIs3dEnabled
        ? {
            position: camera.position,
            direction: camera.direction,
            up: camera.up,
            right: camera.right,
          }
        : {
            center: view.getCenter(),
            resolution: view.getResolution(),
            rotation: view.getRotation(),
            zoom: view.getZoom(),
          };
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

  // Write current state to localStorage
  useOnPageLeave(handlePageLeave);

  // restore other map/layer related settings from local storage
  useEffect(() => {
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
      if (isDefined(mapView) && Object.keys(mapView).length > 0) {
        if (persistenceIs3dEnabled) {
          olcsMap.setEnabled(persistenceIs3dEnabled);
          const camera = olcsMap.getCesiumScene().camera;

          camera.position = mapView.position;
          camera.direction = mapView.direction;
          camera.up = mapView.up;
          camera.right = mapView.right;
        } else {
          map.setView(
            new View(
              Object.assign({}, SettingsProvider.getDefaultMapView(), mapView)
            )
          );
        }
      }

      // only set the 3d state after the map was initialized in order to handle correct view initalization
      setMapIs3dEnabled(persistenceIs3dEnabled);

      const { map_id } = parse(location.search);
      // restore features if available and no query param for map_id is specified
      if (operationalLayers.length > 0 && map_id === undefined) {
        const newOperationalLayers = operationalLayers.map(
          deSerializeOperationalLayer
        );

        setSelectedFeatures(newOperationalLayers);
      } else if (map_id !== undefined) {
        // restore feature from map_id
        queryDocument(map_id)
          .then((res) => {
            const feature = readFeature(
              map_id,
              res,
              undefined,
              undefined,
              mapIs3dEnabled
            );

            // activate fetched layer
            setSelectedFeatures([{ feature, displayedInMap: false }]);

            // focus the map on the layer
            const newMapViewGeometry = feature.getGeometry().clone();
            newMapViewGeometry.scale(1.5);
            map.getView().fit(newMapViewGeometry);
          })
          .catch((e) => {
            console.warn(e);
            setNotification({
              id: "persistence-controller",
              type: "warning",
              text: "Die ausgewählte Karte konnte nicht geladen werden.",
            });
          });
      }
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

  return <></>;
};
