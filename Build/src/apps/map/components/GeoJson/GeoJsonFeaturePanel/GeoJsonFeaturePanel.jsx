/**
 * Created by pouria.rezaei@pikobytes.de on 05/06/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useRef, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { translate, isDefined } from "@util/util";
import { formatDateLocalized, isValidDate } from "@util/date";
import { predefinedProperties } from "../constants";
import { propExtractor } from "../util/util";
import ImageFallback from "../components/ImageFallback";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";
import { FEATURE_PROPERTIES } from "../constants";

import "./GeoJsonFeaturePanel.scss";

const HEADER_PROPERTIES = [...predefinedProperties];

const GeoJsonFeaturePanel = ({ feature, onClose }) => {
  const [isImageBroken, setIsImageBroken] = useState(false);

  const previousFeatureId = useRef(feature.id);

  if (feature.id !== previousFeatureId.current) {
    setIsImageBroken(false);
    previousFeatureId.current = feature.id;
  }

  const properties = useMemo(() => propExtractor(feature), [feature]);

  const { defaultTitle, defaultTime, defaultDescription } = useMemo(() => {
    return {
      defaultTtitle: translate("geojson-featureview-no-title"),
      defaultTime: translate("geojson-featureview-no-time"),
      defaultDescription: translate("geojson-featureview-no-description"),
    };
  }, []);

  const parseTimeForDisplay = useCallback((timestamp) => {
    if (!isDefined(timestamp)) {
      return defaultTime;
    }

    if (!isValidDate(timestamp)) {
      return translate("geojson-featureview-invalid-time");
    }

    return formatDateLocalized(timestamp);
  }, []);

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
    () => isDefined(imageLink) && imageLink.length > 0 && !isImageBroken,
    [imageLink, isImageBroken]
  );

  const customEntries = useMemo(() => {
    return Object.entries(properties).filter(
      ([key]) => !HEADER_PROPERTIES.includes(key)
    );
  }, [properties]);

  return (
    <div className="geojson-feature-panel-root vkf-geojson-feature-view-content">
      <GeoJsonPanelHeader
        title={translate("geojson-featureview-header-text")}
        onCloseClick={onClose}
      />

      <div className="property-container scrollable">
        <div className="image-container">
          {isValidImage && (
            <img
              src={imageLink}
              className="image"
              onError={() => setIsImageBroken(true)}
            />
          )}

          {isImageBroken && <ImageFallback typeOfView={"view"} />}
        </div>
        <div
          className={`predefined-properties-container ${
            !imageLink || false ? "no-image" : ""
          }`}
        >
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
