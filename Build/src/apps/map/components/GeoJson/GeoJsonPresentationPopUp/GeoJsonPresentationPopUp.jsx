/**
 * Created by pouria.rezaei@pikobytes.de on 05/06/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { translate, isDefined } from "../../../../../util/util.js";
import { predefinedProperties } from "../constants.js";
import { propExtractor } from "../util/util.js";
import ImageFallback from "../GeoJsonEditPopUp/components/ImageFallback/ImageFallback.jsx";
import "./GeoJsonPresentationPopUp.scss";

const HEADER_PROPERTIES = [...predefinedProperties, "attribution"];

export const GeoJsonPresentationPopUp = ({
  feature,
  showPresentationView,
  onEdit,
  onClose,
}) => {
  const [properties, setProperties] = useState(propExtractor(feature));
  const [isImageBroken, setIsImageBroken] = useState(false);

  const { imageLink, title, description, attribution } = useMemo(() => {
    return {
      imageLink: properties["img_link"],
      title: properties["title"],
      description: properties["description"],
      attribution: properties["attribution"],
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

  useEffect(() => {
    setProperties(propExtractor(feature));
    setIsImageBroken(false);
  }, [feature]);

  return (
    <div className="presentation-view">
      <div className="header-buttons">
        {showPresentationView && (
          <>
            <button className="btn btn-xs" onClick={onEdit}>
              <span
                className="glyphicon glyphicon-pencil"
                aria-hidden="true"
              ></span>
            </button>
            <button
              className="btn btn-xs"
              onClick={onClose}
              title={translate(`mapsearch-facetedsearch-close`)}
            >
              <span
                className="glyphicon glyphicon-remove"
                aria-hidden="true"
              ></span>
            </button>
          </>
        )}
      </div>
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
        className={`header-container ${!imageLink || false ? "no-image" : ""}`}
      >
        <h2 className="title">
          {title ?? translate("geojson-featureview-no-title")}
        </h2>
        <p className="description body2">
          {description ?? translate("geojson-featureview-no-description")}
        </p>

        {isDefined(attribution) && <p className="attribution">{attribution}</p>}
      </div>

      <div className="metadata-container">
        {customEntries.length > 0 && (
          <h3>{translate("geojson-featureview-metadata")}</h3>
        )}
        {customEntries.map(([key, value]) => (
          <div key={key}>
            <label htmlFor={key}>{key}</label>
            <p className="body1" key={key}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

GeoJsonPresentationPopUp.propTypes = {
  feature: PropTypes.any,
  showPresentationView: PropTypes.bool,
  onEdit: PropTypes.func,
  onClose: PropTypes.func,
};

export default GeoJsonPresentationPopUp;
