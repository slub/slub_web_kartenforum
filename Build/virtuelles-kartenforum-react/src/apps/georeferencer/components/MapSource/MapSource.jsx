/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import axios from "axios";
import Map from "ol/src/Map";
import TileLayer from "ol/src/layer/Tile";
import View from "ol/src/View";
import Zoomify from "ol/src/source/Zoomify";
import "ol/ol.css";

import { mapMetadataState } from "../../atoms/atoms";

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

export const MapSource = () => {
  const refMapContainer = useRef(null);
  const [isMapSourceInit, setIsMapSourceInit] = useState(false);
  const mapMetadata = useRecoilValue(mapMetadataState);

  // Effect for initial loading of the map with the zoomify layer
  useEffect(() => {
    const performInit = async () => {
      // Query zoomify properties
      const zoomifyProps = await queryZoomifyProps(mapMetadata.zoomify_url);

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

      const map = new Map({
        layers: [layer],
        target: refMapContainer.current,
        view: new View({
          // adjust zoom levels to those provided by the source
          resolutions: layer.getSource().getTileGrid().getResolutions(),
          // constrain the center: center cannot be set outside this extent
          extent: extent,
          constrainOnlyCenter: true,
        }),
      });
      map.getView().fit(extent);
    };

    if (
      !isMapSourceInit &&
      mapMetadata !== null &&
      refMapContainer.current !== null
    ) {
      performInit();
    }
  }, [isMapSourceInit, setIsMapSourceInit, mapMetadata]);

  return <div ref={refMapContainer}></div>;
};

export default MapSource;
