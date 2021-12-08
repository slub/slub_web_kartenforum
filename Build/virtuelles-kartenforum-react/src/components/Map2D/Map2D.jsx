/**
 * Created by jacob.mendt@pikobytes.de on 26.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import DragZoom from "ol/src/interaction/DragZoom";
import Fullscreen from "ol/src/control/FullScreen";
import { defaults as defaultInteractions } from "ol/src/interaction";
import GeoJSON from "ol/src/format/GeoJSON";
import Map from "ol/src/Map";
import Tile from "ol/src/layer/Tile";
import View from "ol/src/View";
import Zoom from "ol/src/control/Zoom";
import ZoomToExtent from "ol/src/control/ZoomToExtent";
import XYZ from "ol/src/source/XYZ";
import { translate } from "../../util/util";
import LayerSpyControl from "../Controls/LayerSpyControl";
import "./Map2D.scss";

export const Map2D = (props) => {
  const {
    extent,
    onLoad = () =>
      console.log("No onLoad function was passed to component Map2D."),
    urlNominatim,
    urlsOsmBaseMap,
  } = props;
  const refMapContainer = useRef(null);

  // Effect for initial loading of the georeference map
  useEffect(() => {
    const performInit = async () => {
      // Create the base layer
      const baseLayer = new Tile({
        source: new XYZ({
          urls: urlsOsmBaseMap,
          crossOrigin: "*",
          maxZoom: 18,
        }),
      });

      // Create the map object
      const map = new Map({
        controls: [
          new Fullscreen({
            tipLabel: translate("control-fullscreen-title"),
          }),
          new Zoom({
            zoomInTipLabel: translate("control-zoom-in"),
            zoomOutTipLabel: translate("control-zoom-in"),
          }),
        ],
        interactions: defaultInteractions().extend([new DragZoom()]),
        layers: [baseLayer],
        target: refMapContainer.current,
        view: new View({
          projection: "EPSG:3857",
          center: [871713, 6396955],
          zoom: 4.3,
        }),
      });

      onLoad({
        map: map,
      });

      // Set extent if set
      if (extent !== undefined) {
        const polygon = new GeoJSON().readGeometry(extent, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });

        // Get extent of target source features and focus map to it
        map.getView().fit(polygon.getExtent(), {
          padding: [100, 100, 100, 100],
        });

        // Add a zoom to extent control
        map.addControl(
          new ZoomToExtent({
            tipLabel: translate("control-zoomtoextent-title"),
            extent: polygon.getExtent(),
          })
        );
      }

      // Add a layer spy control
      map.addControl(
        new LayerSpyControl({
          spyLayer: new Tile({
            zIndex: 10,
            attribution: undefined,
            source: new XYZ({
              urls: urlsOsmBaseMap,
              crossOrigin: "*",
              attributions: [],
            }),
          }),
        })
      );
      window.map = map;
    };

    if (refMapContainer.current !== null) {
      performInit();
    }
  }, []);

  return <div className="map-container" ref={refMapContainer}></div>;
};

Map2D.propTypes = {
  extent: PropTypes.object,
  onLoad: PropTypes.func,
  urlNominatim: PropTypes.string,
  urlsOsmBaseMap: PropTypes.arrayOf(PropTypes.string),
};

export default Map2D;
