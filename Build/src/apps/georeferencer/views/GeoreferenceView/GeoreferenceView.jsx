/**
 * Created by jacob.mendt@pikobytes.de on 18.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSetRecoilState, useRecoilValue } from "recoil";
import queryString from "query-string";
import LoadingBar from "../../../../components/LoadingBar/LoadingBar";
import MapSourceView from "../MapSourceView/MapSourceView";
import MapTargetView from "../MapTargetView/MapTargetView";
import { notificationState } from "../../../../atoms/atoms";
import { queryTransformationForMapId } from "../../../../util/apiGeo";
import { queryDocument } from "../../../../util/apiEs";
import {
  isLoadingState,
  mapMetadataState,
  transformationState,
} from "../../atoms/atoms";
import {
  geoJsonExtentFromTransformation,
  geoJsonExtentFromGeoJsonPolygon,
} from "../../util/util";
import "./GeoreferenceView.scss";

export const GeoreferenceView = (props) => {
  const { urlsOsmBaseMap, urlNominatim } = props;
  const setTransformation = useSetRecoilState(transformationState);
  const setMapMetadata = useSetRecoilState(mapMetadataState);
  const setNotification = useSetRecoilState(notificationState);
  const isLoading = useRecoilValue(isLoadingState);
  const [extent, setExtent] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Effects which should be triggered on mount
  useEffect(async () => {
    // Extract the query string and create the initial georeference object for it
    // For testing use map_id=oai:de:slub-dresden:vk:id-10009482
    const qs = queryString.parse(location.search);

    if (qs.map_id !== undefined) {
      const transformationData = await queryTransformationForMapId(qs.map_id);
      const metadata = await queryDocument(qs.map_id);
      let extent =
        transformationData.extent !== null
          ? geoJsonExtentFromGeoJsonPolygon(transformationData.extent)
          : null;

      if (transformationData.pending_jobs) {
        setNotification({
          id: "georeference-view",
          type: "warning",
          text: "Für diese Karte existieren bisher noch unverarbeitete Georeferenzierung.",
        });
      }

      // Extract active transformation
      const targetTransformationId =
        qs.transformation_id !== undefined
          ? parseInt(qs.transformation_id)
          : transformationData.active_transformation_id;

      if (
        transformationData.transformations.length > 0 &&
        targetTransformationId !== null
      ) {
        const activeTransformation = transformationData.transformations.find(
          (t) => t.transformation_id === targetTransformationId
        );
        extent = geoJsonExtentFromTransformation(activeTransformation);

        setTransformation({
          map_id: activeTransformation.map_id,
          clip: activeTransformation.clip,
          overwrites: activeTransformation.transformation_id,
          params: activeTransformation.params,
        });
      } else if (transformationData.active_transformation_id === null) {
        setTransformation({
          map_id: qs.map_id,
          clip: null,
          overwrites: 0,
          params: {
            source: "pixel",
            target: transformationData.default_srs,
            algorithm: "affine",
            gcps: [],
          },
        });
      } else {
        throw new Error("This transformation type is not supported yet.");
      }

      setMapMetadata(metadata);
      setExtent(extent);
      setIsDataLoaded(true);
    }
  }, []);

  return (
    <div className="vkf-georeference-view">
      <div className="outer-map-container">
        <MapSourceView />
      </div>
      <div className="outer-map-container">
        {isDataLoaded && (
          <MapTargetView
            extent={extent !== null ? extent : undefined}
            urlsOsmBaseMap={urlsOsmBaseMap}
            urlNominatim={urlNominatim}
          />
        )}
      </div>
      {isLoading && <LoadingBar />}
    </div>
  );
};

GeoreferenceView.propTypes = {
  urlsOsmBaseMap: PropTypes.arrayOf(PropTypes.string).isRequired,
  urlNominatim: PropTypes.string.isRequired,
};

export default GeoreferenceView;
