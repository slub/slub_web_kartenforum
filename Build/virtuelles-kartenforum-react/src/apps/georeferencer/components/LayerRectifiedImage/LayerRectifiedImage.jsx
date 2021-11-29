/**
 * Created by jacob.mendt@pikobytes.de on 22.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Map from "ol/src/Map";
import Polygon from "ol/src/geom/Polygon";
import Tile from "ol/src/layer/Tile";
import TileWMS from "ol/src/source/TileWMS";

/**
 * Transforms a given polygon geometry to a array of clip pixel.
 *
 * @param {ol.geom.Polygon} polygon
 * @param {ol.Map}
 * @returns {[number, number][]}
 */
function transformPolygonToClipPixel(polygon, map) {
  return polygon.getCoordinates()[0].map((c) => {
    return map.getPixelFromCoordinate(c);
  });
}

/**
 * Layer for displaying a rectified image wms layer.
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export const LayerRectifiedImage = (props) => {
  const { map, layerName, wmsUrl } = props;

  // Initial load layer
  useEffect(() => {
    // Init and add the layer
    const layer = new Tile({
      source: new TileWMS({
        url: wmsUrl.split("?")[0],
        params: {
          LAYERS: layerName,
          VERSION: "1.1.1",
        },
        projection: map.getView().getProjection(),
      }),
      preload: Infinity,
      zIndex: 1,
    });
    map.addLayer(layer);

    // Bind clip behavior by using postrender and prerender events
    const handlePreRender = (e) => {
      // Check if there is a clip polygon
      const clipLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get("key") === "clip");
      if (
        clipLayer !== undefined &&
        clipLayer.getSource().getFeatures().length > 0
      ) {
        // Extract pixel coordinates of the polygon
        const pxCoords = transformPolygonToClipPixel(
          clipLayer.getSource().getFeatures()[0].getGeometry(),
          map
        );
        const pxRatio = 1; // e.frameState.pixelRatio;

        // Clip the given canvas context according to the pixel coordinates
        const canvasRenderingCxt = e.context;
        canvasRenderingCxt.save();

        // Draw clip path and use it for clipping
        canvasRenderingCxt.beginPath();
        canvasRenderingCxt.moveTo(
          pxCoords[0][0] * pxRatio,
          pxCoords[0][1] * pxRatio
        );

        for (let i = 1; i < pxCoords.length; i++) {
          canvasRenderingCxt.lineTo(
            pxCoords[i][0] * pxRatio,
            pxCoords[i][1] * pxRatio
          );
        }
        canvasRenderingCxt.closePath();
        canvasRenderingCxt.clip();
      }
    };
    const handlePostRender = (e) => {
      e.context.restore();
    };
    layer.on("prerender", handlePreRender);
    layer.on("postrender", handlePostRender);

    return () => {
      layer.un("prerender", handlePreRender);
      layer.un("postrender", handlePostRender);

      map.removeLayer(layer);
    };
  }, []);

  return <React.Fragment></React.Fragment>;
};

LayerRectifiedImage.propTypes = {
  clipPolygon: PropTypes.instanceOf(Polygon),
  map: PropTypes.instanceOf(Map).isRequired,
  layerName: PropTypes.string.isRequired,
  wmsUrl: PropTypes.string.isRequired,
};

export default LayerRectifiedImage;
