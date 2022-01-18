/**
 * Created by nicolas.looschen@pikobytes.de on 07.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef, useState } from "react";
import Feature from "ol/Feature";
import { useRecoilState, useSetRecoilState } from "recoil";

import Dropzone from "../Dropzone/Dropzone";
import { translate } from "../../../../util/util";
import { deserializeGeojson } from "./components/DialogEditFeature/util/geojsonSerializer";
import { parseDate } from "./components/DialogEditFeature/util/geojsonParser";
import { notificationState } from "../../../../atoms/atoms";
import DialogAddGeoJson from "./components/DialogAddGeoJson/DialogAddGeoJson";
import { selectedFeaturesState } from "../../atoms/atoms";
import MapWrapper from "./MapWrapper";
import { LAYER_TYPES } from "../CustomLayers/LayerTypes";
import PropTypes from "prop-types";

export const MapWrapperWithGeojsonSupport = ({ mapWrapperProps }) => {
  // state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const setNotification = useSetRecoilState(notificationState);
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );

  // refs
  const refGeoJSON = useRef();

  ///
  // Handler section
  ///

  // read geojson and add in supplied information
  const handleAddGeoJson = (title, dataProjection) => {
    try {
      const features = deserializeGeojson(refGeoJSON.current.content, {
        dataProjection,
      });

      const existingFeaturesWithId = selectedFeatures.filter((selFeature) =>
        selFeature.feature.getId().startsWith(title)
      );

      const feature = new Feature({
        geojsonFeatures: features,
        has_georeference: true,
        title,
        time_changed: parseDate(refGeoJSON.current.modified),
      });

      feature.setId(
        existingFeaturesWithId.length > 0
          ? `${title}_${existingFeaturesWithId.length}`
          : title
      );

      setSelectedFeatures((selFeatures) => [
        ...selFeatures,
        {
          feature,
          displayedInMap: false,
          type: LAYER_TYPES.GEOJSON,
        },
      ]);
    } catch (e) {
      console.log(e);
      handleParseError();
    }

    handleUpdateDialog(false);
  };

  // Store read geojson and open dialog
  const handleFinishReadGeoJson = (geojson) => {
    // store file contents for later use
    refGeoJSON.current = geojson;

    handleUpdateDialog(true);
  };

  // Show notification on error
  const handleParseError = () => {
    setNotification({
      id: "mapWrapper",
      type: "danger",
      text: translate("mapwrapper-geojson-parse-error"),
    });
  };

  // Toggle open state of the AddGeojsonDialog
  const handleUpdateDialog = (newValue) => {
    setIsDialogOpen((oldValue) => {
      if (newValue !== undefined) {
        return newValue;
      } else {
        return !oldValue;
      }
    });
  };

  return (
    <>
      {isDialogOpen && (
        <DialogAddGeoJson
          initialName={refGeoJSON.current?.name}
          onSubmit={handleAddGeoJson}
          onClose={handleUpdateDialog.bind(false)}
        />
      )}
      <Dropzone onDrop={handleFinishReadGeoJson} onError={handleParseError}>
        <MapWrapper {...mapWrapperProps} />
      </Dropzone>
    </>
  );
};

MapWrapperWithGeojsonSupport.propTypes = {
  mapWrapperProps: PropTypes.shape({
    baseMapUrl: PropTypes.arrayOf(PropTypes.string),
    ChildComponent: PropTypes.func,
    enable3d: PropTypes.bool,
    enableTerrain: PropTypes.bool,
    layout: PropTypes.string,
    mapViewSettings: PropTypes.shape({
      center: PropTypes.arrayOf(PropTypes.number),
      projection: PropTypes.string,
      zoom: PropTypes.number,
    }),
    terrainTilesUrl: PropTypes.string,
  }),
};

export default MapWrapperWithGeojsonSupport;
