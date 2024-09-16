/**
 * Created by pouria.rezaei@pikobytes.de on 7/3/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import clsx from "clsx";
import VectorSource from "ol/source/Vector.js";
import GeoJsonPresentationPopUp from "../../components/GeoJsonPresentationPopUp/GeoJsonPresentationPopUp.jsx";
import { mapState, layoutState } from "../../atoms/atoms.js";
import GeoJsonEditPopUp from "../../components/GeoJsonEditPopUp/GeoJsonEditPopUp.jsx";
import "./GeoJsonFeatureView.scss";
import useClickedGeoJsonFeature from "../../hooks/useClickedGeoJsonFeature.js";

export const GeoJsonFeatureView = () => {
  const [showPresentationView, setShowPresentationView] = useState(true);
  const map = useRecoilValue(mapState);
  const layout = useRecoilValue(layoutState);

  // TODO GEOJSON PORT - Handle map click for geojson feature
  // make own geojsonPicker component/hook
  // styles are applied to features while editing and saved to app layer instance on save
  // when clicked on cancel, initial stles are reapplied
  // 3d switch can safely be removed

  const { geoJsonFeature, setGeoJsonFeature } = useClickedGeoJsonFeature({
    map,
    layout,
  });

  if (geoJsonFeature === null && !showPresentationView) {
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
        />
      )}
    </div>
  );
};
export default GeoJsonFeatureView;
