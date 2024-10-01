/**
 * Created by pouria.rezaei@pikobytes.de on 7/3/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import clsx from "clsx";
import GeoJsonPresentationPopUp from "../../components/GeoJson/GeoJsonPresentationPopUp";
import {
  mapState,
  layoutState,
  selectedLayersState,
} from "../../atoms/atoms.js";
import GeoJsonEditPopUp from "../../components/GeoJson/GeoJsonEditPopUp";
import useClickedGeoJsonFeature from "../../hooks/useClickedGeoJsonFeature.js";
import "./GeoJsonFeatureView.scss";

export const GeoJsonFeatureView = () => {
  const [showPresentationView, setShowPresentationView] = useState(true);
  const map = useRecoilValue(mapState);
  const layout = useRecoilValue(layoutState);
  const selectedLayers = useRecoilValue(selectedLayersState);

  const {
    geoJsonFeature,
    setGeoJsonFeature,
    sourceId,
    resetClickedFeature,
    removeFeatureState,
  } = useClickedGeoJsonFeature({
    map,
    layout,
  });

  useEffect(() => {
    setShowPresentationView(true);
  }, [setShowPresentationView, geoJsonFeature]);

  const selectedLayer = useMemo(() => {
    return selectedLayers.find((layer) => layer.getId() === sourceId);
  }, [geoJsonFeature, selectedLayers, sourceId]);

  const sourceLayer = useMemo(() => {
    return map.getSource(sourceId);
  }, [map, sourceId]);

  const handleFeatureStateChange = useCallback(
    (featureState) => {
      const source = sourceId;
      const id = geoJsonFeature.id;
      map.setFeatureState({ source, id }, featureState);
    },
    [map, sourceId, geoJsonFeature]
  );

  /**
   * The close handler for the GeoJsonEditPopUp component.
   * If options.doRemoveFeatureState is set to true, the feature state for the currently selected feature is cleared.
   * The feature state must NOT be cleared when saving the feature data, as this causes a glitch during rendering.
   * @param {object} options
   */
  const handleEditPopupClose = useCallback(
    ({ doRemoveFeatureState } = { doRemoveFeatureState: true }) => {
      if (doRemoveFeatureState) {
        removeFeatureState();
      }
      setShowPresentationView(true);
    },
    [setShowPresentationView, removeFeatureState]
  );

  const handleFeatureSave = useCallback(
    ({ addOrUpdateProperties, removeProperties }) => {
      const featureId = geoJsonFeature.id;
      const sourceDiff = {
        update: [
          {
            id: geoJsonFeature.id,
            addOrUpdateProperties,
            removeProperties,
          },
        ],
      };

      sourceLayer
        .updateData(sourceDiff)
        .getData()
        .then((geoJSON) => {
          const idx = geoJSON.features.findIndex(
            (feature) => feature.id === featureId
          );

          if (idx < 0) {
            console.error(
              `Cannot save feature with inexisting id '${featureId}'.`
            );
            return;
          }

          selectedLayer.setGeoJSON(geoJSON);
          setGeoJsonFeature(geoJSON.features[idx]);
          handleEditPopupClose({ doRemoveFeatureState: false });
        });
    },
    [
      geoJsonFeature,
      sourceLayer,
      selectedLayer,
      setGeoJsonFeature,
      handleEditPopupClose,
    ]
  );

  // Close the map overlay
  const handleOverlayClose = useCallback(() => {
    resetClickedFeature();
  }, [resetClickedFeature]);

  const handleShowEditDialog = useCallback(() => {
    setShowPresentationView(false);
  }, [setShowPresentationView]);

  const handleFeatureDelete = useCallback(
    (feature) => {
      const { id } = feature;
      sourceLayer.updateData({ remove: [id] });
      selectedLayer.removeFeature(id);

      handleOverlayClose();
    },
    [sourceLayer, selectedLayer, handleOverlayClose]
  );

  return (
    <div
      className={clsx("vkf-geojson-view-root", geoJsonFeature !== null && "in")}
    >
      {geoJsonFeature !== null && showPresentationView && (
        <GeoJsonPresentationPopUp
          feature={geoJsonFeature}
          showPresentationView={showPresentationView}
          onEdit={handleShowEditDialog}
          onClose={handleOverlayClose}
        />
      )}
      {geoJsonFeature !== null && !showPresentationView && (
        <GeoJsonEditPopUp
          feature={geoJsonFeature}
          onFeatureStateChange={handleFeatureStateChange}
          onDelete={handleFeatureDelete}
          onClose={handleEditPopupClose}
          onSave={handleFeatureSave}
        />
      )}
    </div>
  );
};
export default GeoJsonFeatureView;
