/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";

import { mapState } from "../../../map/atoms/atoms.js";
import {
  mosaicMapGeometryLayerState,
  mosaicMapSelectedFeaturesState,
} from "../../atoms/atoms.js";
import { MAP_SEARCH_HOVER_FEATURE } from "../../../map/config/styles.js";
import { isDefined } from "../../../../util/util.js";
import { createSingleSheetPreviewForFeature } from "../../../map/components/MapWrapper/util.js";
import { getLayers } from "../../../map/components/LayerManagement/util.js";
import { LAYER_TYPES } from "../../../map/components/CustomLayers/LayerTypes";

export const MosaicGeometryLayer = () => {
  // State
  const map = useRecoilValue(mapState);
  const [mapOverlayLayer, setMapOverlayLayer] = useRecoilState(
    mosaicMapGeometryLayerState
  );
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    mosaicMapSelectedFeaturesState
  );

  ////
  // Handler section
  ////

  // keep the overlay layer on top of the map layer stack
  const handleMapLayerChange = useCallback(
    (event) => {
      const topLayer = event.target.getArray().at(-1);

      if (topLayer === mapOverlayLayer) {
        map.setLayerIndex(mapOverlayLayer, 0);
      }
    },
    [map, mapOverlayLayer]
  );

  ////
  // Effect section
  ////

  // Add feature overlay layer shown on hover and the source for the backend fatches
  useEffect(() => {
    if (map !== undefined) {
      const newMapOverlayLayer = new VectorLayer({
        source: new VectorSource(),
        style: function () {
          return [MAP_SEARCH_HOVER_FEATURE];
        },
      });

      map.addLayer(newMapOverlayLayer);

      setMapOverlayLayer(newMapOverlayLayer);
    }
  }, [map]);

  // sync features with layers
  useEffect(() => {
    if (mapOverlayLayer !== undefined && map !== undefined) {
      const layers = getLayers(map).reverse();
      const vectorSource = mapOverlayLayer.getSource();

      selectedFeatures.forEach((selectedFeature) => {
        const { showPreview = false, feature } = selectedFeature;

        if (feature.get("has_georeference")) {
          try {
            if (!showPreview) {
              const layer = layers.find((layer) => {
                return layer.getId() === feature.getId();
              });

              if (layer !== undefined) {
                map.removeLayer(layer);
              }
            } else if (
              showPreview &&
              layers.find((layer) => layer.getId() === feature.getId()) ===
                undefined
            ) {
              createSingleSheetPreviewForFeature(feature).then((newLayer) => {
                map.addLayer(newLayer);
                selectedFeature.displayedInMap = true;
              });
            }

            if (!vectorSource.hasFeature(feature)) {
              vectorSource.addFeature(feature);
            }
          } catch (e) {
            setSelectedFeatures((oldSelectedFeatures) =>
              oldSelectedFeatures.filter(
                (f) => f.feature.getId() !== feature.getId()
              )
            );
          }
        }
      });

      vectorSource.getFeatures().forEach((feature) => {
        const selectedFeature = selectedFeatures.find(
          (sF) => sF.feature.getId() === feature.getId()
        );
        if (selectedFeature === undefined) {
          vectorSource.removeFeature(feature);
        }
      });

      getLayers(map).forEach((layer) => {
        const selectedFeature = selectedFeatures.find(
          (sF) => sF.feature.getId() === layer.getId()
        );

        // remove all preview layers which are not found in the selected features list
        if (
          layer.get("layer_type") === LAYER_TYPES.PREVIEW &&
          selectedFeature === undefined &&
          map !== undefined
        ) {
          map.removeLayer(layer);
        }
      });
    }
  }, [selectedFeatures]);

  // Add map handler to keep overlay layer on top of the layer stack
  useEffect(() => {
    // hold the overlay layer on top of the historic map layers
    if (isDefined(map) && isDefined(mapOverlayLayer)) {
      map.getLayers().on("add", handleMapLayerChange);
    }
  }, [mapOverlayLayer, map, handleMapLayerChange]);
  return <></>;
};

MosaicGeometryLayer.propTypes = {};

export default MosaicGeometryLayer;
