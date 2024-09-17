/**
 * Created by pouria.rezaei@pikobytes.de on 7/3/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import clsx from "clsx";
import GeoJsonPresentationPopUp from "../../components/GeoJsonPresentationPopUp/GeoJsonPresentationPopUp.jsx";
import {
  mapState,
  layoutState,
  selectedFeaturesState,
} from "../../atoms/atoms.js";
import GeoJsonEditPopUp from "../../components/GeoJsonEditPopUp/GeoJsonEditPopUp.jsx";
import "./GeoJsonFeatureView.scss";
import useClickedGeoJsonFeature from "../../hooks/useClickedGeoJsonFeature.js";

export const GeoJsonFeatureView = () => {
  const [showPresentationView, setShowPresentationView] = useState(true);
  const map = useRecoilValue(mapState);
  const layout = useRecoilValue(layoutState);
  const selectedFeatures = useRecoilValue(selectedFeaturesState);

  // TODO GEOJSON PORT - Handle map click for geojson feature
  // styles are applied to features while editing and saved to app layer instance on save
  // when clicked on cancel, initial stles are reapplied

  const { geoJsonFeature, setGeoJsonFeature } = useClickedGeoJsonFeature({
    map,
    layout,
  });

  const selectedLayer = useMemo(() => {
    return selectedFeatures.find(
      (feature) => feature.getId() === geoJsonFeature?.source
    );
  }, [geoJsonFeature, selectedFeatures]);

  if (geoJsonFeature === null && !showPresentationView) {
    setShowPresentationView(true);
  }

  const handleFeatureDelete = (feature) => {
    const { id } = feature;
    const sourceLayer = map.getSource(feature.source);
    sourceLayer.updateData({ remove: [id] });
    selectedLayer.removeFeature(id);

    handleOverlayClose();
  };

  const handleFeatureSave = (id, featureProperties) => {
    setGeoJsonFeature((oldFeature) => ({
      ...oldFeature,
      properties: featureProperties,
    }));

    selectedLayer.updateFeature(id, featureProperties);
  };

  // Close the map overlay
  const handleOverlayClose = () => {
    setGeoJsonFeature(null);
  };

  const handleShowEditDialog = () => {
    setShowPresentationView(false);
  };

  const handleShowPresentationDialog = () => {
    setShowPresentationView(true);
  };

  useEffect(() => {
    if (showPresentationView === false) {
      setShowPresentationView(true);
    }
  }, [geoJsonFeature]);

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
          onDelete={handleFeatureDelete}
          onClose={handleShowPresentationDialog}
          onSave={handleFeatureSave}
        />
      )}
    </div>
  );
};
export default GeoJsonFeatureView;
