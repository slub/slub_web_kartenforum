/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import { transform } from "ol/proj";

import {
  rectifiedImageParamsState,
  targetViewParamsState,
} from "../../atoms/atoms";
import Map2D from "../../../../components/Map2D/Map2D";
import LayerRectifiedImage from "../../../../components/LayerRectifiedImage/LayerRectifiedImage";
import PlacenameSearch from "../../../../components/PlacenameSearch/PlacenameSearch.jsx";
import OpenLayerOpacitySlider from "../../../../components/OpacitySlider/OpenLayerOpacitySlider.jsx";
import SettingsProvider from "../../../../SettingsProvider.js";
import "./MapTargetView.scss";

export const MapTargetView = (props) => {
  const { extent, urlNominatim, urlsOsmBaseMap } = props;
  const rectifiedImageParams = useRecoilValue(rectifiedImageParamsState);
  const [pureRectifyLayer, setPureRectifyLayer] = useState(null);
  const [targetViewParams, setTargetViewParams] = useRecoilState(
    targetViewParamsState
  );

  // Handle select position via placename
  const handleSelectPosition = (feature) => {
    const [lon, lat] = [feature.lonlat.x, feature.lonlat.y];
    const sourceProjection = "EPSG:4326";
    const targetProjection = "EPSG:3857";

    const center = transform(
      [parseFloat(lon), parseFloat(lat)],
      sourceProjection,
      targetProjection
    );

    if (targetViewParams?.map) {
      const mapView = targetViewParams.map.getView();
      mapView.setCenter(center);
      mapView.setZoom(12);
    }
  };

  return (
    <div className="vkf-mapview-target">
      <Map2D
        extent={extent}
        onLoad={(m) => setTargetViewParams(m)}
        urlNominatim={urlNominatim}
        urlsOsmBaseMap={urlsOsmBaseMap}
      >
        {targetViewParams !== null && (
          <div>
            <div className="placenamesearch-container">
              <PlacenameSearch
                onSelectPosition={handleSelectPosition}
                searchUrl={SettingsProvider.getNominatimUrl()}
              />
            </div>
            {pureRectifyLayer !== null && (
              <OpenLayerOpacitySlider
                layer={pureRectifyLayer}
                orientation="vertical"
              />
            )}
          </div>
        )}
      </Map2D>

      {targetViewParams !== null && rectifiedImageParams !== null && (
        <LayerRectifiedImage
          key={rectifiedImageParams.wms_url}
          map={targetViewParams.map}
          layerName={rectifiedImageParams.layer_name}
          onLoad={(layer) => setPureRectifyLayer(layer)}
          wmsUrl={rectifiedImageParams.wms_url}
        />
      )}
    </div>
  );
};

MapTargetView.propTypes = {
  extent: PropTypes.arrayOf(PropTypes.number),
  urlNominatim: PropTypes.string,
  urlsOsmBaseMap: PropTypes.arrayOf(PropTypes.string),
};

export default MapTargetView;
