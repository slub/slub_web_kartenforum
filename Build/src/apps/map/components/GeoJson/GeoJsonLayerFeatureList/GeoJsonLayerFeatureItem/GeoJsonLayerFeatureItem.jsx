/*
 * Created by tom.schulze@pikobytes.de on 18.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useMemo } from "react";
import PropTypes from "prop-types";

import VkfIcon from "@components/VkfIcon";
import { isDefined, translate } from "@util/util";
import { formatDateLocalized, isValidDate } from "@util/date";
import { GEOMETRY_TYPE } from "../../constants";

import { FEATURE_PROPERTIES } from "../../constants";

import "./GeoJsonLayerFeatureItem.scss";

const GeoJsonFeatureItem = ({ geometry, properties, onClick }) => {
  const { defaultTitle, defaultTime } = useMemo(() => {
    return {
      defaultTtitle: translate("geojson-featureview-no-title"),
      defaultTime: translate("geojson-featureview-no-time"),
    };
  }, []);

  const coercedType = useMemo(() => {
    const { type } = geometry;
    if (type === GEOMETRY_TYPE.MULTI_LINE_STRING) {
      return GEOMETRY_TYPE.LINE_STRING;
    }

    if (type === GEOMETRY_TYPE.MULTI_POLYGON) {
      return GEOMETRY_TYPE.POLYGON;
    }

    if (type === GEOMETRY_TYPE.MULTI_POINT) {
      return GEOMETRY_TYPE.POINT;
    }

    if (type === GEOMETRY_TYPE.GEOMETRY_COLLECTION) {
      return GEOMETRY_TYPE.POLYGON;
    }

    if (Object.values(GEOMETRY_TYPE).includes(type)) {
      return type;
    }

    // fallback
    return GEOMETRY_TYPE.POLYGON;
  }, [geometry]);

  const time = useMemo(() => {
    const timestamp = properties[FEATURE_PROPERTIES.time];

    if (!isDefined(timestamp)) {
      return defaultTime;
    }

    if (!isValidDate(timestamp)) {
      return translate("geojson-featureview-invalid-time");
    }

    return formatDateLocalized(timestamp);
  }, [properties[FEATURE_PROPERTIES.time]]);

  const title = useMemo(
    () => properties[FEATURE_PROPERTIES.title] ?? defaultTitle,

    [properties[FEATURE_PROPERTIES.title]]
  );

  return (
    <div className="geojson-feature-item-root" onClick={onClick}>
      <div className="geojson-feature-item-container">
        <div className="sub-headline">
          <div className={`type-icon icon--${coercedType}`}>
            <VkfIcon name={coercedType} />
          </div>
          <div className="type-text">{coercedType}</div>
        </div>
        <div className="title">{title}</div>
        <div className="details">
          {translate("geojson-featureview-time")}: {time}
        </div>
      </div>
    </div>
  );
};

GeoJsonFeatureItem.propTypes = {
  properties: PropTypes.object.isRequired,
  geometry: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default GeoJsonFeatureItem;
