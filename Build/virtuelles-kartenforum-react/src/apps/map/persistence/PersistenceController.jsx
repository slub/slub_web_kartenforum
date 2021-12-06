/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */

import { Feature, View } from "ol";
import { Polygon } from "ol/geom";
import React, { useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { map3dState, mapState, selectedFeaturesState } from "../atoms/atoms";
import { isDefined } from "../../../util/util";
import { useLocalStorage, useOnPageLeave } from "./util";

const PERSISTENCE_OBJECT_KEY = "vk_persistence_container";

export const PersistenceController = () => {
  const [mapIs3dEnabled, setMapIs3dEnabled] = useRecoilState(map3dState);
  const map = useRecoilValue(mapState);

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
      const view = map.getView();

      const newPersistedView = {
        center: view.getCenter(),
        resolution: view.getResolution(),
        zoom: view.getZoom(),
      };

      newPersistenceObject["mapView"] = newPersistedView;

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
            f["opacity"] = opacity;
          }
        }
      });
    }

    // write changes to localStorage
    setPersistenceObject(newPersistenceObject);
  }, [map, mapIs3dEnabled, selectedFeatures]);

  // Write current state to localStorage
  useOnPageLeave(handlePageLeave);

  // restore 3d state from local storage
  useEffect(() => {
    setMapIs3dEnabled(persistenceIs3dEnabled);
  }, []);

  // restore other map/layer related settings from local storage
  useEffect(() => {
    if (map !== undefined) {
      // restore mapview if available
      if (isDefined(mapView) && Object.keys(mapView).length > 0) {
        map.setView(new View(mapView));
      }

      // restore features if available
      if (operationalLayers.length > 0) {
        const newOperationalLayers = operationalLayers.map(
          ({ coordinates, id, properties, opacity }) => {
            const feature = new Feature({ geometry: new Polygon(coordinates) });
            feature.setId(id);
            const { geometry, ...rest } = properties;
            feature.setProperties(rest);
            return { feature, displayedInMap: false, opacity };
          }
        );

        setSelectedFeatures(newOperationalLayers);
      }
    }
  }, [map]);

  return <></>;
};
