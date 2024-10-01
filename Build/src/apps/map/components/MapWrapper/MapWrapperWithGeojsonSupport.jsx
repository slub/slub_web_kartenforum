/**
 * Created by nicolas.looschen@pikobytes.de on 07.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import PropTypes from "prop-types";

import Dropzone from "../Dropzone/Dropzone";
import { isDefined, translate } from "../../../../util/util";
import { notificationState } from "../../../../atoms/atoms";
import DialogAddGeoJson from "./components/DialogAddGeoJson/DialogAddGeoJson";
import { mapState, selectedFeaturesState } from "../../atoms/atoms";
import MapWrapper, { mapWrapperProps } from "./MapWrapper";
import { METADATA, GeoJsonLayer } from "../CustomLayers";

export const MapWrapperWithGeojsonSupport = ({ mapWrapperProps }) => {
  // state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const setNotification = useSetRecoilState(notificationState);
  const setSelectedFeatures = useSetRecoilState(selectedFeaturesState);
  const map = useRecoilValue(mapState);

  // refs
  const refGeoJSON = useRef();

  ///
  // Handler section
  ///

  // read geojson and add in supplied information
  const handleAddGeoJson = (title) => {
    if (isDefined(map)) {
      try {
        const geoJSON = refGeoJSON.current.content;
        const metadata = {
          [METADATA.title]: title,
          [METADATA.timeChanged]: refGeoJSON.current.modified,
        };

        const geoJSONLayer = new GeoJsonLayer({
          metadata,
          geoJSON,
        });

        geoJSONLayer.addLayerToMap(map);

        setSelectedFeatures((selFeatures) => [...selFeatures, geoJSONLayer]);
      } catch (e) {
        console.log(e);
        handleParseError();
      }

      handleUpdateDialog(false);
    }
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
        <MapWrapper
          onAddGeoJson={handleFinishReadGeoJson}
          {...mapWrapperProps}
        />
      </Dropzone>
    </>
  );
};

MapWrapperWithGeojsonSupport.propTypes = {
  mapWrapperProps: PropTypes.shape(mapWrapperProps),
};

export default MapWrapperWithGeojsonSupport;
