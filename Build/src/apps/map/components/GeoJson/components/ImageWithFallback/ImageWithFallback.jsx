/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useMemo, useState, useRef } from "react";
import { translate } from "@util/util";
import PropTypes from "prop-types";
import VkfIcon from "@components/VkfIcon";

import "./ImageWithFallback.scss";

const VIEW_MODE = {
  INITIAL: 0,
  IMAGE: 1,
  ERROR: 2,
  PLACEHOLDER: 3,
};

const ImageWithFallback = ({ imageLink, showPlaceholder, imageAsPreview }) => {
  const [viewMode, setViewMode] = useState(VIEW_MODE.INITIAL);

  const previousImageLink = useRef(imageLink);

  if (imageLink !== previousImageLink.current) {
    setViewMode(VIEW_MODE.INITIAL);
    previousImageLink.current = imageLink;
  }

  if (viewMode === VIEW_MODE.INITIAL) {
    if (imageLink.length === 0 && showPlaceholder) {
      setViewMode(VIEW_MODE.PLACEHOLDER);
    } else {
      setViewMode(VIEW_MODE.IMAGE);
    }
  }

  const modifier = useMemo(() => {
    if (viewMode === VIEW_MODE.PLACEHOLDER) {
      return "placeholder";
    }

    if (viewMode === VIEW_MODE.ERROR) {
      return "error";
    }

    return "image";
  }, [viewMode]);

  return (
    <div className="image-with-fallback-root">
      <div className={`image-container ${modifier}`}>
        {viewMode === VIEW_MODE.IMAGE && (
          <img
            className={`${imageAsPreview ? "preview" : ""}`}
            src={imageLink}
            onError={() => setViewMode(VIEW_MODE.ERROR)}
          />
        )}

        {viewMode !== VIEW_MODE.IMAGE && (
          <div className={`image-fallback-icon ${modifier}`}>
            <VkfIcon name="image-placeholder" />
          </div>
        )}
        {viewMode === VIEW_MODE.ERROR && (
          <p className="image-fallback-text">
            {translate("geojson-image-fallback-p")}
          </p>
        )}
      </div>
    </div>
  );
};

ImageWithFallback.defaultPropTypes = {
  imageAsPreview: false,
  showPlaceholder: false,
  imageLink: "",
};

ImageWithFallback.propTypes = {
  imageLink: PropTypes.string,
  showPlaceholder: PropTypes.bool,
  imageAsPreview: PropTypes.bool,
};

export default ImageWithFallback;
