/**
 * Created by pouria.rezaei@pikobytes.de on 05/06/23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { translate } from "../../../../util/util.js";
import { propExtractor } from "../GeoJsonEditPopUp/util/util.js";
import ImageFallback from "../GeoJsonEditPopUp/components/ImageFallback/ImageFallback.jsx";
import "./GeoJsonPresentationPopUp.scss";

export const GeoJsonPresentationPopUp = ({
  feature,
  showPresentationView,
  onEdit,
  onClose,
}) => {
  const [properties, setProperties] = useState(propExtractor(feature));
  const [imageLink, setImageLink] = useState(properties["img_link"] || "");

  useEffect(() => {
    setImageLink(properties["img_link"] || "");
    setProperties(propExtractor(feature));
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
        {imageLink && imageLink !== "broken" ? (
          <img
            src={imageLink}
            className="image"
            onError={() => setImageLink("broken")}
          />
        ) : null}

        {imageLink === "broken" && <ImageFallback typeOfView={"view"} />}
      </div>
      <div
        className={`header-container ${!imageLink || false ? "no-image" : ""}`}
      >
        <h2 className="title">
          {properties["title"] ?? translate("geojson-featureview-no-title")}
        </h2>
        <p className="description body2">
          {properties["description"] ??
            translate("geojson-featureview-no-description")}
        </p>

        {properties["attribution"] !== null &&
          properties["attribution"] !== undefined && (
            <p className="attribution">{properties["attribution"]}</p>
          )}
      </div>

      <div className="metadata-container">
        {Object.keys(properties).some(
          (key) =>
            !["title", "description", "img_link", "attribution"].includes(key)
        ) && <h3>{translate("geojson-featureview-metadata")}</h3>}

        {Object.keys(properties).length !== 0 &&
          Object.entries(properties).map(([key, value]) => {
            if (
              ["title", "description", "img_link", "attribution"].includes(key)
            ) {
              return null;
            }

            return (
              <div key={key}>
                <label htmlFor={key}>{key}</label>
                <p className="body1" key={key}>
                  {value}
                </p>
              </div>
            );
          })}
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
