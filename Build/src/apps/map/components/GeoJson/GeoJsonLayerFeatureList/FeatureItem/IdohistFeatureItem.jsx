/*
 * Created by tom.schulze@pikobytes.de on 30.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { memo, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

import { isDefined, translate } from "@util/util";

import { FEATURE_PROPERTIES } from "../../constants";
import { formatFeatureTime } from "../../util/formatters";
import { IDOHIST_FEATURE_PROPS } from "@map/components/CustomLayers/GeoJsonLayer/IdohistMapInteractionStrategy/constants";

import "./FeatureItem.scss";
import SettingsProvider, { LANGUAGE_CODE } from "@settings-provider";

const IdohistFeatureItem = ({ data, index, style }) => {
  const feature = data.features[index];
  const { properties } = feature;

  const onClick = useCallback(() => {
    data.onFeatureClick(feature.id);
  }, [data.onFeatureClick, feature.id]);

  const { defaultTitle } = useMemo(() => {
    return {
      defaultTitle: translate("geojson-featureview-no-title"),
    };
  }, []);

  const formattedTime = useMemo(() => {
    const isGerman =
      SettingsProvider.getSettings().LANGUAGE_CODE === LANGUAGE_CODE.DE;

    const timeLabel = isGerman
      ? properties[IDOHIST_FEATURE_PROPS.timeLabelDe]
      : properties[IDOHIST_FEATURE_PROPS.timeLabelEn];

    if (isDefined(timeLabel)) {
      return timeLabel;
    }

    const time = properties[FEATURE_PROPERTIES.time];
    return formatFeatureTime(time);
  }, [properties[FEATURE_PROPERTIES.time]]);

  const { title, affiliation } = useMemo(
    () => ({
      title: properties[FEATURE_PROPERTIES.title] ?? defaultTitle,
      affiliation: properties[IDOHIST_FEATURE_PROPS.parentLabel] ?? "",
    }),

    [
      properties[FEATURE_PROPERTIES.title],
      properties[IDOHIST_FEATURE_PROPS.parentLabel],
    ]
  );

  return (
    <li className="geojson-feature-item-root" onClick={onClick} style={style}>
      <div className="geojson-feature-item-container">
        <div className="title">{title}</div>
        <div className="details">
          {translate("idohist-date-label")} {formattedTime} <br />
          {affiliation !== "" && affiliation}
        </div>
      </div>
    </li>
  );
};

IdohistFeatureItem.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.object,
};

export default memo(IdohistFeatureItem);
