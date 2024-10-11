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
import LoadingBar from "@components/LoadingBar";
import MapSourceView from "@georeferencer/views/MapSourceView/MapSourceView";
import MapTargetView from "@georeferencer/views/MapTargetView/MapTargetView";
import { notificationState } from "@atoms";
import { queryTransformationForMapId } from "@util/apiGeo";
import { queryDocument } from "@util/apiEs";
import {
  isLoadingState,
  mapMetadataState,
  transformationState,
} from "@georeferencer/atoms";
import {
  geoJsonExtentFromTransformation,
  geoJsonExtentFromGeoJsonPolygon,
} from "@georeferencer/util/util";
import "./GeoreferenceView.scss";

const parseTransformation = (transformation) => {
  // remove all but the required properties from the clip and the transformation
  return {
    map_id: transformation.map_id,
    clip:
      transformation?.clip !== undefined && transformation.clip !== null
        ? {
            type: transformation.clip.type,
            coordinates: transformation.clip.coordinates,
          }
        : undefined,
    overwrites: transformation.transformation_id,
    params: {
      algorithm: transformation?.params?.algorithm ?? "affine",
      gcps: transformation?.params?.gcps ?? [],
    },
  };
};

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
      const { transformations, additional_properties } =
        await queryTransformationForMapId(qs.map_id);
      const {
        active_transformation_id,
        extent: transf_extent,
        pending_jobs,
      } = additional_properties;

      const metadata = await queryDocument(qs.map_id);

      let extent =
        transf_extent !== null
          ? geoJsonExtentFromGeoJsonPolygon(transf_extent)
          : null;

      if (pending_jobs) {
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
          : active_transformation_id;

      if (transformations.length > 0 && targetTransformationId !== null) {
        const activeTransformation = transformations.find(
          (t) => t.transformation_id === targetTransformationId
        );

        extent = geoJsonExtentFromTransformation(activeTransformation);

        setTransformation(parseTransformation(activeTransformation));
      } else if (active_transformation_id === null) {
        setTransformation({
          map_id: qs.map_id,
          clip: null,
          overwrites: 0,
          params: {
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
