/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilValue } from "recoil";
import "ol/ol.css";

import { mapMetadataState } from "../../atoms/atoms";
import ZoomifyMap from "../../../../components/ZoomifyMap/ZoomifyMap";
import ToolboxSourceMap from "../../components/ToolboxSourceMap/ToolboxSourceMap";
import "./MapSourceView.scss";

export const MapSourceView = () => {
  const mapMetadata = useRecoilValue(mapMetadataState);

  // Handler for catching onLoad event
  const handleOnLoad = (o) => {
    console.log(o);
  };

  return (
    <div className="vk-mapview-source">
      {mapMetadata !== null && (
        <ZoomifyMap
          urlImageProperties={mapMetadata.zoomify_url}
          onLoad={handleOnLoad}
        />
      )}

      <ToolboxSourceMap />
    </div>
  );
};

export default MapSourceView;
