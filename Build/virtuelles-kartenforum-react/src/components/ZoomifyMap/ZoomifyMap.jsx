/**
 * Created by jacob.mendt@pikobytes.de on 12.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import clsx from "clsx";
import DragZoom from "ol/src/interaction/DragZoom";
import Fullscreen from "ol/src/control/FullScreen";
import { defaults as defaultInteractions } from "ol/src/interaction";
import Map from "ol/src/Map";
import TileLayer from "ol/src/layer/Tile";
import View from "ol/src/View";
import Zoom from "ol/src/control/Zoom";
import Zoomify from "ol/src/source/Zoomify";
import ZoomToExtent from "ol/src/control/ZoomToExtent";
import "ol/ol.css";
import "./ZoomifyMap.scss";

/**
 * Queries the zoomify properties
 * @param {string} urlImageProperties - Url to the ImageProperties.xml
 * @returns {Promise<{
 *     width: number,
 *     height: number,
 *     url: string,
 * }>}
 */
async function queryZoomifyProps(urlImageProperties) {
  try {
    const response = await axios.get(urlImageProperties);
    if (response.status === 200) {
      // The response is expected to be a xml string.
      const xmlParser = new DOMParser();
      const xmlDoc = xmlParser.parseFromString(response.data, "text/xml");
      return {
        width: parseInt(xmlDoc.firstChild.attributes.WIDTH.value, 0),
        height: parseInt(xmlDoc.firstChild.attributes.HEIGHT.value, 0),
        url: urlImageProperties.substring(
          0,
          urlImageProperties.lastIndexOf("/") + 1
        ),
      };
    } else {
      throw new Error("Could not fetch ImageProperties.xml");
    }
  } catch (e) {
    console.error(
      "Something went wrong while trying to fetch the ImageProperties.xml."
    );
    console.error(e);
  }
}

export const ZoomifyMap = (props) => {
  const { className = "", onLoad, urlImageProperties } = props;
  const refMapContainer = useRef(null);

  // Effect for initial loading of the map with the zoomify layer
  useEffect(() => {
    const performInit = async () => {
      const padding = 50;
      // Query zoomify properties
      const zoomifyProps = await queryZoomifyProps(urlImageProperties);

      // Create the zoomify source
      const zoomifySource = new Zoomify({
        url: zoomifyProps.url,
        size: [zoomifyProps.width, zoomifyProps.height],
        crossOrigin: "anonymous",
        zDirection: -1, // Ensure we get a tile with the screen resolution or higher
      });
      const extent = zoomifySource.getTileGrid().getExtent();

      // Add source to the map
      const layer = new TileLayer({
        source: zoomifySource,
      });

      // Create the view
      const view = new View({
        // adjust zoom levels to those provided by the source
        resolutions: layer.getSource().getTileGrid().getResolutions(),
        // constrain the center: center cannot be set outside this extent
        extent: extent,
        constrainOnlyCenter: true,
      });

      const map = new Map({
        controls: [new Fullscreen(), new Zoom()],
        interactions: defaultInteractions().extend([new DragZoom()]),
        layers: [layer],
        target: refMapContainer.current,
        view: view,
      });

      // Set initial extent
      view.fit(extent, { padding: [50, 50, 50, 50] });

      // After the map was initialized we create a ZoomToExtent control and add it to the map
      const size = map.getSize();
      map.addControl(
        new ZoomToExtent({
          extent: view.calculateExtent([size[0] + padding, size[1] + padding]),
        })
      );

      // In case a onLoad listener is defined call it after all is loaded
      if (onLoad) {
        onLoad({
          layer: layer,
          map: map,
          source: zoomifySource,
          zoomifyProps: zoomifyProps,
        });
      }
    };

    performInit();
  }, [urlImageProperties]);

  return (
    <div
      className={clsx("vk-mapview-zoomify", className)}
      ref={refMapContainer}
    ></div>
  );
};

ZoomifyMap.propTypes = {
  className: PropTypes.string,
  onLoad: PropTypes.func,
  urlImageProperties: PropTypes.string.isRequired,
};

export default ZoomifyMap;
