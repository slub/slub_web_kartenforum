/**
 * Created by pouria.rezaei@pikobytes.de on 05/06/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { translate, isDefined } from "@util/util";
import { predefinedProperties } from "../../constants";
import { getNonStylingProperties } from "../../util/util";
import ImageWithFallback from "../../components/ImageWithFallback";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";
import { FEATURE_PROPERTIES } from "../../constants";
import FeaturePermalinkButton from "../../components/FeaturePermalinkButton";
import { formatFeatureTime } from "../../util/formatters";
import CustomValue from "./CustomValue";

import "./VkfFeaturePanel.scss";

const HEADER_PROPERTIES = [...predefinedProperties];
const canBeDisplayed = (value) =>
  isDefined(value) && value !== "" && typeof value !== "object";

const GeoJsonFeaturePanel = ({ feature, onClose }) => {
  const properties = useMemo(() => getNonStylingProperties(feature), [feature]);

  const { defaultTitle, defaultDescription } = useMemo(() => {
    return {
      defaultTitle: translate("geojson-featureview-no-title"),
      defaultDescription: translate("geojson-featureview-no-description"),
    };
  }, []);

  const { imageLink, title, description, time } = useMemo(() => {
    const time = properties[FEATURE_PROPERTIES.time];
    const parsedTime = isDefined(time) ? formatFeatureTime(time) : null;

    return {
      imageLink: properties[FEATURE_PROPERTIES.imgLink],
      title: properties[FEATURE_PROPERTIES.title] ?? defaultTitle,
      description:
        properties[FEATURE_PROPERTIES.description] ?? defaultDescription,
      time: parsedTime,
    };
  }, [properties]);

  const isValidImage = useMemo(
    () => isDefined(imageLink) && imageLink.length > 0,
    [imageLink]
  );

  const customEntries = useMemo(() => {
    return Object.entries(properties).filter(
      ([key, value]) =>
        !HEADER_PROPERTIES.includes(key) && canBeDisplayed(value)
    );
  }, [properties]);

  return (
    <div className="geojson-feature-panel-root vkf-feature-panel">
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
            <p className="geojson-feature-property-text">{description}</p>
          </div>
          {time !== null && (
            <div className="time-section">
              <p className="geojson-feature-property-label">
                {translate("geojson-featureview-time")}
              </p>
              <p className="geojson-feature-property-text">{time}</p>
            </div>
          )}
        </div>

        {customEntries.length > 0 && (
          <div className="custom-properties-container">
            {customEntries.map(([key, value]) => (
              <div key={key}>
                <p className="geojson-feature-property-label">{key}</p>
                <CustomValue value={value} />
              </div>
            ))}
          </div>
        )}
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
