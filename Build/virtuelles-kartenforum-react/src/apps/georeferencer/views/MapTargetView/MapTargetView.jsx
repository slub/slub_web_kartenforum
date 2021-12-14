/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import {
  rectifiedImageParamsState,
  targetViewParamsState,
} from "../../atoms/atoms";
import Map2D from "../../../../components/Map2D/Map2D";
import LayerRectifiedImage from "../../../../components/LayerRectifiedImage/LayerRectifiedImage";
import "./MapTargetView.scss";

export const MapTargetView = (props) => {
  const { extent, urlNominatim, urlsOsmBaseMap } = props;
  const rectifiedImageParams = useRecoilValue(rectifiedImageParamsState);
  const [targetViewParams, setTargetViewParams] = useRecoilState(
    targetViewParamsState
  );

  return (
    <div className="vkf-mapview-target">
      <Map2D
        extent={extent}
        onLoad={(m) => setTargetViewParams(m)}
        urlNominatim={urlNominatim}
        urlsOsmBaseMap={urlsOsmBaseMap}
      />
      {targetViewParams !== null && rectifiedImageParams !== null && (
        <LayerRectifiedImage
          key={rectifiedImageParams.wms_url}
          map={targetViewParams.map}
          layerName={rectifiedImageParams.layer_name}
          wmsUrl={rectifiedImageParams.wms_url}
        />
      )}
    </div>
  );
};

MapTargetView.propTypes = {
  extent: PropTypes.object,
  urlNominatim: PropTypes.string,
  urlsOsmBaseMap: PropTypes.arrayOf(PropTypes.string),
};

export default MapTargetView;
