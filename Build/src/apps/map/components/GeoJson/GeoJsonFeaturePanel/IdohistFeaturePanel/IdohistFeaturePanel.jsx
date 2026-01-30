/*
 * Created by tom.schulze@pikobytes.de on 26.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { translate, isDefined, isValidUrl } from "@util/util";

import { getNonStylingProperties } from "../../util/util";
import ImageWithFallback from "../../components/ImageWithFallback";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";
import { FEATURE_PROPERTIES } from "../../constants";
import FeaturePermalinkButton from "../../components/FeaturePermalinkButton";
import { formatFeatureTime } from "../../util/formatters";

import { IDOHIST_FEATURE_PROPS } from "@map/components/CustomLayers/GeoJsonLayer/IdohistMapInteractionStrategy/constants";
import IdohistCertaintyItem from "./IdohistCertaintyItem";
import { coerceCertainty } from "@map/components/CustomLayers/GeoJsonLayer/IdohistMapInteractionStrategy/util";
import SettingsProvider, { LANGUAGE_CODE } from "@settings-provider";

import "./IdohistFeaturePanel.scss";

const GeoJsonFeaturePanel = ({ feature, onClose }) => {
  const properties = useMemo(() => getNonStylingProperties(feature), [feature]);

  const { defaultTitle, defaultDescription } = useMemo(() => {
    return {
      defaultTitle: translate("geojson-featureview-no-title"),
      defaultDescription: translate("geojson-featureview-no-description"),
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

  const { imageLink, title, description, permalink, certainties, affiliation } =
    useMemo(() => {
      const url = properties[IDOHIST_FEATURE_PROPS.permalink];
      const permalink = isValidUrl(url) ? url : "";

      return {
        imageLink: properties[FEATURE_PROPERTIES.imgLink],
        title: properties[FEATURE_PROPERTIES.title] ?? defaultTitle,
        description:
          properties[FEATURE_PROPERTIES.description] ?? defaultDescription,
        tags: properties[IDOHIST_FEATURE_PROPS.tags] ?? [],
        permalink,
        affiliation: properties[IDOHIST_FEATURE_PROPS.parentLabel] ?? "",
        certainties: {
          spatial: coerceCertainty(
            properties[IDOHIST_FEATURE_PROPS.spatialCertainty]
          ),
          content: coerceCertainty(
            properties[IDOHIST_FEATURE_PROPS.contentCertainty]
          ),
          temporal: coerceCertainty(
            properties[IDOHIST_FEATURE_PROPS.temporalCertainty]
          ),
        },
      };
    }, [properties]);

  const isValidImage = useMemo(
    () => isDefined(imageLink) && imageLink.length > 0,
    [imageLink]
  );

  return (
    <div className="geojson-feature-panel-root idohist-feature-panel">
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
          {affiliation !== "" && (
            <div className="affiliation-section">
              <p className="geojson-feature-property-label">
                {translate("idohist-affiliation-label")}
              </p>
              <p className="affiliation geojson-feature-property-text">
                {affiliation}
              </p>
            </div>
          )}
          <div className="time-section">
            <p className="geojson-feature-property-label">
              {translate("idohist-date-label")}
            </p>
            <p className="time geojson-feature-property-text">
              {formattedTime}
            </p>
          </div>
          <div className="description-section">
            <p className="geojson-feature-property-label">
              {translate("geojson-featureview-description")}
            </p>
            <p className="description geojson-feature-property-text">
              {description}
            </p>
          </div>
          {permalink !== "" && (
            <div className="permalink-section">
              <p className="geojson-feature-property-label">
                {translate("idohist-permalink-label")}
              </p>
              <a href={permalink} target="_blank" rel="noreferrer">
                <p className="geojson-feature-property-link">{permalink}</p>
              </a>
            </div>
          )}
          <div className="certainties-section">
            <p className="geojson-feature-property-label">
              {translate("idohist-certainty-label")}
            </p>
            <div className="certainty-items">
              <IdohistCertaintyItem
                label={translate("idohist-certainty-label-spatial")}
                value={certainties.spatial}
              />
              <IdohistCertaintyItem
                label={translate("idohist-certainty-label-temporal")}
                value={certainties.temporal}
              />
              <IdohistCertaintyItem
                label={translate("idohist-certainty-label-content")}
                value={certainties.content}
              />
            </div>
          </div>
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
