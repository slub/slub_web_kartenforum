/**
 * Created by pouria.rezaei@pikobytes.de on 05/06/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { translate, isDefined } from "@util/util";
import { predefinedProperties } from "../constants";
import { propExtractor } from "../util/util";
import ImageWithFallback from "../components/ImageWithFallback";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";
import { FEATURE_PROPERTIES } from "../constants";
import FeaturePermalinkButton from "../components/FeaturePermalinkButton";
import { formatFeatureTime } from "../util/formatters";

import "./GeoJsonFeaturePanel.scss";

const HEADER_PROPERTIES = [...predefinedProperties];

const GeoJsonFeaturePanel = ({ feature, onClose }) => {
  const properties = useMemo(() => propExtractor(feature), [feature]);

  const { defaultTitle, defaultDescription } = useMemo(() => {
    return {
      defaultTitle: translate("geojson-featureview-no-title"),
      defaultDescription: translate("geojson-featureview-no-description"),
    };
  }, []);

  const parseTimeForDisplay = useCallback(
    (time) => formatFeatureTime(time),
    []
  );

  const { imageLink, title, description, time } = useMemo(() => {
    return {
      imageLink: properties[FEATURE_PROPERTIES.imgLink],
      title: properties[FEATURE_PROPERTIES.title] ?? defaultTitle,
      description:
        properties[FEATURE_PROPERTIES.description] ?? defaultDescription,
      time: parseTimeForDisplay(properties[FEATURE_PROPERTIES.time]),
    };
  }, [properties]);

  const isValidImage = useMemo(
    () => isDefined(imageLink) && imageLink.length > 0,
    [imageLink]
  );

  const customEntries = useMemo(() => {
    return Object.entries(properties).filter(
      ([key]) => !HEADER_PROPERTIES.includes(key)
    );
  }, [properties]);

  return (
    <div className="geojson-feature-panel-root vkf-geojson-feature-view-content">
      <GeoJsonPanelHeader
        extraButton={<FeaturePermalinkButton />}
        title={translate("geojson-featureview-header-text")}
        onCloseClick={onClose}
      />
      <div className="property-container scrollable">
        {isValidImage && <ImageWithFallback imageUrl={imageLink} />}
        <div className="predefined-properties-container">
          <div className="title-section ">
            <span className="geojson-feature-property-label">
              {translate("geojson-featureview-title")}
            </span>
            <span className="title">{title}</span>
          </div>
          <div className="description-section">
            <p className="geojson-feature-property-label">
              {translate("geojson-featureview-description")}
            </p>
            <p className="description geojson-feature-property-input">
              {description}
            </p>
          </div>
          <div className="time-section">
            <p className="geojson-feature-property-label">
              {translate("geojson-featureview-time")}
            </p>
            <p className="time geojson-feature-property-input">{time}</p>
          </div>
        </div>

        <div className="properties-container">
          {customEntries.length > 0 && (
            <p className="geojson-feature-property-label">
              {translate("geojson-featureview-metadata")}
            </p>
          )}
          {customEntries.map(([key, value]) => (
            <div key={key}>
              <label htmlFor={key} className="geojson-feature-property-label">
                {key}
              </label>
              <p className="geojson-feature-property-input" key={key}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

GeoJsonFeaturePanel.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    geometry: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
};

export default GeoJsonFeaturePanel;
