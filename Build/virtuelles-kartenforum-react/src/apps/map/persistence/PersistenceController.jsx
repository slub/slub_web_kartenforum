/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import { View } from "ol";
import React, { useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import olcsCore from "olcs/core";
import { parse } from "query-string";

import {
  map3dState,
  mapState,
  olcsMapState,
  selectedFeaturesState,
} from "../atoms/atoms";
import { isDefined } from "../../../util/util";
import SettingsProvider from "../../../SettingsProvider";
import {
  deSerializeOperationalLayer,
  useLocalStorage,
  useOnPageLeave,
} from "./util";
import { queryDocument } from "../../../util/apiEs";
import { readFeature } from "../../../util/parser";
import { notificationState } from "../../../atoms/atoms";

const PERSISTENCE_OBJECT_KEY = "vk_persistence_container";

export const PersistenceController = () => {
  const [mapIs3dEnabled, setMapIs3dEnabled] = useRecoilState(map3dState);
  const map = useRecoilValue(mapState);
  const olcsMap = useRecoilValue(olcsMapState);
  const settings = SettingsProvider.getSettings();
  const setNotification = useSetRecoilState(notificationState);

  /**
   * @type {{
   * is3dEnabled: boolean,
   * mapView: { center: [number, number], resolution: number, zoom: number },
   * operationalLayers: { coordinates: number[], id: string, properties: Object, opacity: number }[]
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
    operationalLayers,
    is3dEnabled: persistenceIs3dEnabled,
    mapView,
  } = persistenceObject;

  // Persist current state to localStorage
  const handlePageLeave = useCallback(() => {
    // Persist basic feature settings
    const newPersistenceObject = {
      is3dEnabled: mapIs3dEnabled,
      operationalLayers: selectedFeatures.map(({ feature }) => ({
        id: feature.getId(),
        properties: feature.getProperties(),
        coordinates: feature.getGeometry().getCoordinates(),
      })),
    };

    if (map !== undefined) {
      // Persist map view
      let view;

      if (mapIs3dEnabled && isDefined(olcsMap) && olcsMap.getEnabled()) {
        // for the 3d case perform the rotation back into 2d view to persist the not-rotated coordinates
        const ol3d = olcsMap,
          scene = ol3d.getCesiumScene(),
          csCamera = scene.camera,
          bottom = olcsCore.pickBottomPoint(scene),
          transform = Cesium.Matrix4.fromTranslation(bottom),
          angle = olcsCore.computeAngleToZenith(scene, bottom),
          olCsCamera = ol3d.getCamera();

        // perform the rotation on the cesium camera => "rotateAroundAxis"
        const oldTransform = new Cesium.Matrix4();
        csCamera.transform.clone(oldTransform);
        csCamera.lookAtTransform(transform);
        csCamera.rotate(csCamera.right, -angle);
        csCamera.lookAtTransform(oldTransform);

        // use the olcs camera representation to update the ol map view
        olCsCamera.updateView();
        // access the private internal view which equals the ol map view
        view = olCsCamera.view_;

        // apply the resolution and rotation constraints
        view.setResolution(view.getResolution());
        view.setRotation(view.getRotation());
      } else {
        view = map.getView();
      }

      newPersistenceObject.mapView = {
        center: view.getCenter(),
        resolution: view.getResolution(),
        zoom: view.getZoom(),
      };

      // Persist opacities if they are available
      const layers = map.getLayers().getArray();
      layers.forEach((layer) => {
        if (layer.allowUseInLayerManagement) {
          const id = layer.getId();
          const opacity = layer.getOpacity();

          const f = newPersistenceObject.operationalLayers.find(
            (operationalLayer) => operationalLayer.id === id
          );

          if (f !== undefined) {
            f.opacity = opacity;
          }
        }
      });
    }

    // write changes to localStorage
    setPersistenceObject(newPersistenceObject);
  }, [map, mapIs3dEnabled, selectedFeatures]);

  // Write current state to localStorage
  useOnPageLeave(handlePageLeave);

  // restore other map/layer related settings from local storage
  useEffect(() => {
    if (map !== undefined) {
      // restore mapview if available
      if (isDefined(mapView) && Object.keys(mapView).length > 0) {
        map.setView(
          new View(Object.assign({}, settings.MAPVIEW_PARAMS, mapView))
        );
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
  }, [map]);

  return <></>;
};
