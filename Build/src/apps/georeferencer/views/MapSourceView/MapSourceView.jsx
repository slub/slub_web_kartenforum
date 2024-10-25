/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { mapMetadataState, sourceViewParamsState } from "@georeferencer/atoms";
import ZoomifyMap from "@components/ZoomifyMap";
import "./MapSourceView.scss";

export const MapSourceView = () => {
  const mapMetadata = useRecoilValue(mapMetadataState);
  const setSourceViewParams = useSetRecoilState(sourceViewParamsState);

  // Handler for catching onLoad event
  const handleOnLoad = (o) => {
    setSourceViewParams(o);
  };

  return (
    <div className="vkf-mapview-source">
      {mapMetadata !== null && (
        <ZoomifyMap
          urlImageProperties={mapMetadata.zoomify_url}
          onLoad={handleOnLoad}
        />
      )}
    </div>
  );
};

export default MapSourceView;
