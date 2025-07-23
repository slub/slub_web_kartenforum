/*
 * Created by tom.schulze@pikobytes.de on 15.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useMemo, useRef } from "react";
import PropTypes from "prop-types";

import "./GeoJsonLayerFeatureList.scss";
import { translate } from "@util/util";
import { FixedSizeList } from "react-window";
import { useSize } from "@util/hooks";
import { useRecoilValue } from "recoil";
import { geoJsonLayerViewFilteredFeaturesState } from "@map/views/GeoJsonLayerView/atoms";

const GeoJsonLayerFeatureList = ({
  className,
  onFeatureClick,
  FeatureItem,
}) => {
  const features = useRecoilValue(geoJsonLayerViewFilteredFeaturesState);
  const itemData = useMemo(
    () => ({ features, onFeatureClick }),
    [features, onFeatureClick]
  );

  const refContainer = useRef(null);
  const { height } = useSize(refContainer);

  return (
    <>
      <div className={className} ref={refContainer}>
        <div className="geojson-layer-feature-list-container">
          {features.length === 0 && (
            <div className="no-feature-container">
              {translate("geojsonlayerpanel-no-features")}
            </div>
          )}
          {features.length > 0 && (
            <FixedSizeList
              height={height}
              overscanCount={3}
              innerElementType="ul"
              itemData={itemData}
              itemCount={features.length}
              width={340}
              itemSize={110}
            >
              {FeatureItem}
            </FixedSizeList>
          )}
        </div>
      </div>
    </>
  );
};

GeoJsonLayerFeatureList.propTypes = {
  className: PropTypes.string,
  onFeatureClick: PropTypes.func.isRequired,
  FeatureItem: PropTypes.object.isRequired,
};

export default GeoJsonLayerFeatureList;
