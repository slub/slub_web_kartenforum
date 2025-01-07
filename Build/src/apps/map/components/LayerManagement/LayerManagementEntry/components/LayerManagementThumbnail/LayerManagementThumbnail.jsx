/**
 * Created by nicolas.looschen@pikobytes.de on 04.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { LAYER_TYPES, METADATA } from "@map/components/CustomLayers";
import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { translate, isDefined } from "@util/util";
import clsx from "clsx";
import {
  getFallbackSrc,
  getImageSrcFromLayer,
} from "@map/components/MapSearch/util";

export const LayerManagementThumbnail = ({ layer }) => {
  const [src, setSrc] = useState(getImageSrcFromLayer(layer));

  const fallbackSrc = useMemo(() => getFallbackSrc(layer), [layer]);

  const { layerType, layerTitle, isMosaic, isRemoteVectorMap } = useMemo(() => {
    return {
      layerType: layer.getType(),
      layerTitle: layer.getMetadata(METADATA.title),
      isMosaic: layer.getMetadata(METADATA.type) === LAYER_TYPES.MOSAIC_MAP,
      isRemoteVectorMap: isDefined(layer.getMetadata(METADATA.vectorMapId)),
    };
  }, [layer]);

  // load fallback image in case the image from the supplied url cannot be loaded
  const handleError = useCallback(() => {
    if (src !== fallbackSrc) {
      setSrc(fallbackSrc);
    }
  }, [fallbackSrc]);

  return (
    <div className="thumbnail-container">
      <img
        onError={handleError}
        src={src}
        alt={`Thumbnail Image of Map for ${layerTitle}`}
      />

      {layerType === LAYER_TYPES.VECTOR_MAP && (
        <span
          className={clsx(
            "vector-badge",
            !isRemoteVectorMap && "local-vector-badge"
          )}
        >
          {translate("vector-badge-title")}
        </span>
      )}

      {isMosaic && (
        <span className="mosaic-badge">{translate("mosaic-badge-title")}</span>
      )}
    </div>
  );
};

LayerManagementThumbnail.propTypes = {
  layer: PropTypes.object.isRequired,
};

export default LayerManagementThumbnail;
