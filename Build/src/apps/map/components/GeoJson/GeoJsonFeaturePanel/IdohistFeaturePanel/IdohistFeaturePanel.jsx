/*
 * Created by tom.schulze@pikobytes.de on 26.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { translate, isDefined, isValidUrl } from "@util/util";

import { getNonStylingProperties } from "../../util/util";
import ImageWithFallback from "../../components/ImageWithFallback";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";
import { FEATURE_PROPERTIES } from "../../constants";
import FeaturePermalinkButton from "../../components/FeaturePermalinkButton";
import { formatFeatureTime } from "../../util/formatters";

import "./IdohistFeaturePanel.scss";
import { IDOHIST_FEATURE_PROPS } from "@map/components/CustomLayers/GeoJsonLayer/IdohistMapInteractionStrategy/constants";
import IdohistTagPill from "./IdohistTagPill";
import IdohistCertaintyItem from "./IdohistCertaintyItem";
import { coerceCertainty } from "@map/components/CustomLayers/GeoJsonLayer/IdohistMapInteractionStrategy/util";

const GeoJsonFeaturePanel = ({ feature, onClose }) => {
  const properties = useMemo(() => getNonStylingProperties(feature), [feature]);

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

  const { imageLink, title, description, time, tags, permalink, certainties } =
    useMemo(() => {
      const url = properties[IDOHIST_FEATURE_PROPS.permalink];
      const permalink = isValidUrl(url) ? url : "";

      return {
        imageLink: properties[FEATURE_PROPERTIES.imgLink],
        title: properties[FEATURE_PROPERTIES.title] ?? defaultTitle,
        description:
          properties[FEATURE_PROPERTIES.description] ?? defaultDescription,
        time: parseTimeForDisplay(properties[FEATURE_PROPERTIES.time]),
        tags: properties[IDOHIST_FEATURE_PROPS.tags] ?? [],
        permalink,
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
          <div className="time-section">
            <p className="geojson-feature-property-label">
              {translate("idohist-date-label")}
            </p>
            <p className="time geojson-feature-property-text">{time}</p>
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
                <p className="geojson-feature-property-text">{permalink}</p>
              </a>
            </div>
          )}
          {tags.length > 0 && (
            <div className="tag-section">
              <p className="geojson-feature-property-label">
                {translate("idohist-tags-label")}
              </p>
              <div className="tags">
                {tags.map((tag) => (
                  <IdohistTagPill key={tag} value={tag} />
                ))}
              </div>
            </div>
          )}
          <div className="certainties-section">
            <p className="geojson-feature-property-label">
              {translate("idohist-certainty-header")}
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
