/*
 * Created by tom.schulze@pikobytes.de on 15.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";
import GeoJsonLayerFeatureItem from "./GeoJsonLayerFeatureItem";

import "./GeoJsonLayerFeatureList.scss";
import { translate } from "@util/util";

const GeoJsonLayerFeatureList = ({ className, features, onFeatureClick }) => {
  return (
    <>
      <div className={className}>
        <div className="geojson-layer-feature-list-container">
          {features.length === 0 && (
            <div className="no-feature-container">
              {translate("geojsonlayerpanel-no-features")}
            </div>
          )}
          {features.length > 0 && (
            <div className="feature-list">
              {features.map((feature) => (
                <GeoJsonLayerFeatureItem
                  key={feature.id}
                  onClick={() => onFeatureClick(feature.id)}
                  properties={feature.properties}
                  geometry={feature.geometry}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

GeoJsonLayerFeatureList.propTypes = {
  className: PropTypes.string,
  features: PropTypes.array.isRequired,
  onFeatureClick: PropTypes.func.isRequired,
};

export default GeoJsonLayerFeatureList;
