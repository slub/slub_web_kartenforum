/*
 * Created by tom.schulze@pikobytes.de on 18.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { memo, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

import VkfIcon from "@components/VkfIcon";
import { translate } from "@util/util";
import { GEOMETRY_TYPE } from "../../constants";

import { FEATURE_PROPERTIES } from "../../constants";
import { formatFeatureTime } from "../../util/formatters";

import "./FeatureItem.scss";

const GeoJsonFeatureItem = ({ data, index, style }) => {
  const feature = data.features[index];
  const { properties, geometry } = feature;

  const onClick = useCallback(() => {
    data.onFeatureClick(feature.id);
  }, [data.onFeatureClick, feature.id]);

  const { defaultTitle } = useMemo(() => {
    return {
      defaultTitle: translate("geojson-featureview-no-title"),
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

  const formattedTime = useMemo(() => {
    const time = properties[FEATURE_PROPERTIES.time];

    return formatFeatureTime(time);
  }, [properties[FEATURE_PROPERTIES.time]]);

  const title = useMemo(
    () => properties[FEATURE_PROPERTIES.title] ?? defaultTitle,

    [properties[FEATURE_PROPERTIES.title]]
  );

  return (
    <li className="geojson-feature-item-root" onClick={onClick} style={style}>
      <div className="geojson-feature-item-container">
        <div className="sub-headline">
          <div className={`type-icon icon--${coercedType}`}>
            <VkfIcon name={coercedType} />
          </div>
          <div className="type-text">{coercedType}</div>
        </div>
        <div className="title">{title}</div>
        <div className="details">
          {translate("geojson-featureview-time")} {formattedTime}
        </div>
      </div>
    </li>
  );
};

GeoJsonFeatureItem.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.object,
};

export default memo(GeoJsonFeatureItem);
