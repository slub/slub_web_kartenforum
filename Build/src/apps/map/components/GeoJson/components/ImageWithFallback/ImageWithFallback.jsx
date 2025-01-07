/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import { default as Skeleton } from "react-loading-skeleton/lib/skeleton";

import { translate } from "@util/util";
import VkfIcon from "@components/VkfIcon";

import "./ImageWithFallback.scss";

const VIEW_MODE = {
  INITIAL: 0,
  IMAGE: 1,
  ERROR: 2,
  PLACEHOLDER: 3,
  LOADING: 4,
};

const ImageWithFallback = ({ imageUrl, showPlaceholder, imageAsPreview }) => {
  const [viewMode, setViewMode] = useState(VIEW_MODE.INITIAL);

  const previousImageUrl = useRef(imageUrl);

  if (imageUrl !== previousImageUrl.current) {
    setViewMode(VIEW_MODE.INITIAL);
    previousImageUrl.current = imageUrl;
  }

  if (viewMode === VIEW_MODE.INITIAL) {
    if (imageUrl.length === 0 && showPlaceholder) {
      setViewMode(VIEW_MODE.PLACEHOLDER);
    } else {
      setViewMode(VIEW_MODE.LOADING);
    }
  }

  const SHOW_IMAGE =
    viewMode === VIEW_MODE.LOADING || viewMode === VIEW_MODE.IMAGE;

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
        {SHOW_IMAGE && (
          <>
            {viewMode === VIEW_MODE.LOADING && (
              <Skeleton.default height={180} />
            )}

            <img
              className={`${imageAsPreview ? "preview" : ""} ${
                viewMode === VIEW_MODE.LOADING ? "loading" : ""
              }`}
              src={imageUrl}
              onLoad={() => setViewMode(VIEW_MODE.IMAGE)}
              onError={() => setViewMode(VIEW_MODE.ERROR)}
            />
          </>
        )}

        {!SHOW_IMAGE && (
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
  imageUrl: "",
};

ImageWithFallback.propTypes = {
  imageUrl: PropTypes.string,
  showPlaceholder: PropTypes.bool,
  imageAsPreview: PropTypes.bool,
};

export default ImageWithFallback;
