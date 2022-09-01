/**
 * Created by pouria.rezaei@pikobytes.de on 7/3/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import clsx from "clsx";
import VectorSource from "ol/source/Vector.js";
import GeoJsonPresentationPopUp from "../../components/GeoJsonPresentationPopUp/GeoJsonPresentationPopUp.jsx";
import { mapState, selectedGeoJsonFeatureState } from "../../atoms/atoms.js";
import GeoJsonEditPopUp from "../../components/GeoJsonEditPopUp/GeoJsonEditPopUp.jsx";
import "./GeoJsonFeatureView.scss";

export const GeoJsonFeatureView = () => {
  const [showPresentationView, setShowPresentationView] = useState(true);
  const map = useRecoilValue(mapState);
  const [selectedGeoJsonFeature, setSelectedGeoJsonFeature] = useRecoilState(
    selectedGeoJsonFeatureState
  );

  if (selectedGeoJsonFeature === null && !showPresentationView) {
    setShowPresentationView(true);
  }

  // deletes a feature from the map and closes the overlay afterwards
  const handleFeatureDelete = (feature) => {
    map.getLayers().forEach((layer) => {
      const source = layer.getSource();
      if (source instanceof VectorSource) {
        const features = source.getFeatures();
        const containsFeature = features.includes(feature);
        if (containsFeature) {
          source.removeFeature(feature);
        }
      }
    });

    handleOverlayClose();
  };
  // Close the map overlay
  const handleOverlayClose = () => {
    setSelectedGeoJsonFeature(null);
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
  }, [selectedGeoJsonFeature]);

  return (
    <div
      className={clsx(
        "vkf-geojson-view-root",
        selectedGeoJsonFeature !== null && "in"
      )}
    >
      {selectedGeoJsonFeature !== null && showPresentationView && (
        <GeoJsonPresentationPopUp
          feature={selectedGeoJsonFeature}
          showPresentationView={showPresentationView}
          onEdit={handleShowEditDialog}
          onClose={handleOverlayClose}
        />
      )}
      {selectedGeoJsonFeature !== null && !showPresentationView && (
        <GeoJsonEditPopUp
          feature={selectedGeoJsonFeature}
          onDelete={handleFeatureDelete}
          onClose={handleShowPresentationDialog}
        />
      )}
    </div>
  );
};
export default GeoJsonFeatureView;
